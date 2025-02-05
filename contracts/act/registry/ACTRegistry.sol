// SPDX-License-Identifier: None
pragma solidity 0.8.28;

import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {Epochs} from "../../common/Epochs.sol";
import {Guarded} from "../../common/Guarded.sol";
import {Initializable} from "../../common/Initializable.sol";
import {ForwarderContext} from "../../metatx/ForwarderContext.sol";
import {IACTImpl} from "../impls/interfaces/IACTImpl.sol";
import {IACTRegistry} from "./interfaces/IACTRegistry.sol";

contract ACTRegistry is
  EIP712,
  Guarded,
  Initializable,
  ForwarderContext,
  IACTRegistry
{
  bytes32 private constant TOKEN_TYPED_DATA_HASH =
    keccak256(
      "Token(uint8 variant,string name,string symbol,address maintainer)"
    );

  // enums

  enum Variants {
    UnknownOrAny, // 0
    Fungible, // 1
    NonFungible // 2
  }

  // structs

  struct TokenTypedData {
    Variants variant;
    string name;
    string symbol;
    address maintainer;
  }

  struct ExtensionOptions {
    bool active;
    Variants variant;
  }

  struct CreatedToken {
    bytes32 salt;
    Variants variant;
  }

  // storage

  Epochs.Settings private _epochsSettings;

  mapping(Variants => address) private _variantImpls;

  mapping(address => ExtensionOptions) private _extensionOptions;

  mapping(address => CreatedToken) private _createdTokens;

  // errors

  error MsgSenderIsNotACreatedToken();

  error ZeroAddressVariantImpl();

  error ZeroAddressExtension();

  error InvalidVariant();

  // events

  event TokenCreated(
    address token,
    Variants variant,
    bytes data,
    uint256 timestamp
  );

  event TokenEvent(address token, bytes data, uint256 timestamp);

  event VariantUpdated(Variants variant, address impl);

  event ExtensionUpdated(address extension, ExtensionOptions options);

  // modifiers

  modifier onlyCreatedToken() {
    _requireOnlyCreatedToken();

    _;
  }

  // deployment

  constructor(
    string memory eip712Name,
    address initializer
  ) EIP712(eip712Name, "1") Initializable(initializer) {
    //
  }

  function initialize(
    address owner,
    address[] calldata guardians,
    address forwarder,
    uint48 epochWindowLength
  ) external initializeOnce {
    _setInitialOwner(owner);
    _setInitialGuardians(guardians);

    _forwarder = forwarder;
    _epochsSettings = Epochs.initEpochSettings(epochWindowLength);
  }

  // external getters

  function getCurrentEpoch() external view returns (uint48) {
    return Epochs.calcEpoch(_epochsSettings);
  }

  function getEpochSettings() external view returns (Epochs.Settings memory) {
    return _epochsSettings;
  }

  function getVariantImpl(Variants variant) external view returns (address) {
    return _variantImpls[variant];
  }

  function getExtensionOptions(
    address extension
  ) external view returns (ExtensionOptions memory) {
    return _extensionOptions[extension];
  }

  function isExtensionEnabled(address extension) external view returns (bool) {
    ExtensionOptions memory extensionOptions = _extensionOptions[extension];

    return
      extensionOptions.active &&
      (extensionOptions.variant == Variants.UnknownOrAny ||
        extensionOptions.variant == _createdTokens[msg.sender].variant);
  }

  function getCreatedToken(
    address token
  ) external view returns (CreatedToken memory) {
    return _createdTokens[token];
  }

  function hashToken(
    TokenTypedData calldata token
  ) external view returns (bytes32) {
    return
      _hashTokenTypedData(
        token.variant,
        token.name,
        token.symbol,
        token.maintainer
      );
  }

  function computeTokenAddress(
    Variants variant,
    string calldata symbol
  ) external view returns (address) {
    return _computeTokenAddress(variant, symbol);
  }

  // external setters

  function setVariant(
    Variants variant,
    address impl
  ) external onlyOwner returns (bool) {
    require(variant != Variants.UnknownOrAny, InvalidVariant());

    require(impl != address(0), ZeroAddressVariantImpl());

    if (_variantImpls[variant] == impl) {
      // nothing to do
      return false;
    }

    _variantImpls[variant] = impl;

    emit VariantUpdated(variant, impl);

    return true;
  }

  function setExtension(
    address extension,
    ExtensionOptions memory options
  ) external onlyOwner returns (bool) {
    require(extension != address(0), ZeroAddressExtension());

    ExtensionOptions memory oldOptions = _extensionOptions[extension];

    if (
      oldOptions.active == options.active &&
      oldOptions.variant == options.variant
    ) {
      // nothing to do
      return false;
    }

    _extensionOptions[extension] = options;

    emit ExtensionUpdated(extension, options);

    return true;
  }

  function createToken(
    Variants variant,
    string calldata name,
    string calldata symbol,
    address maintainer
  ) external onlyOwner returns (address) {
    return _createToken(variant, name, symbol, maintainer);
  }

  function createToken(
    Variants variant,
    string calldata name,
    string calldata symbol,
    address maintainer,
    bytes calldata guardianSignature
  ) external returns (address) {
    _requireGuardianSignature(
      _hashTokenTypedData(variant, name, symbol, maintainer),
      guardianSignature
    );

    return _createToken(variant, name, symbol, maintainer);
  }

  function emitTokenEvent(bytes calldata data) external onlyCreatedToken {
    emit TokenEvent(msg.sender, data, block.timestamp);
  }

  // private getters

  function _requireOnlyCreatedToken() private view {
    require(
      _createdTokens[msg.sender].variant != Variants.UnknownOrAny,
      MsgSenderIsNotACreatedToken()
    );
  }

  function _hashTokenTypedData(
    Variants variant,
    string calldata name,
    string calldata symbol,
    address maintainer
  ) private view returns (bytes32) {
    return
      _hashTypedDataV4(
        keccak256(
          abi.encode(
            TOKEN_TYPED_DATA_HASH,
            variant,
            keccak256(abi.encodePacked(name)),
            keccak256(abi.encodePacked(symbol)),
            maintainer
          )
        )
      );
  }

  function _computeTokenSalt(
    string calldata symbol
  ) private pure returns (bytes32) {
    return keccak256(abi.encodePacked(symbol));
  }

  function _computeTokenAddress(
    Variants variant,
    string calldata symbol
  ) private view returns (address result) {
    address impl = _variantImpls[variant];

    if (impl != address(0)) {
      result = Clones.predictDeterministicAddress(
        impl,
        _computeTokenSalt(symbol),
        address(this)
      );
    }

    return result;
  }

  // private setters

  function _createToken(
    Variants variant,
    string calldata name,
    string calldata symbol,
    address maintainer
  ) private returns (address token) {
    address impl = _variantImpls[variant];

    require(impl != address(0), InvalidVariant());

    bytes32 salt = _computeTokenSalt(symbol);

    token = Clones.cloneDeterministic(impl, salt);

    bytes memory data = abi.encodeCall(
      IACTImpl.initialize,
      (_forwarder, name, symbol, maintainer, _epochsSettings)
    );

    // solhint-disable-next-line avoid-low-level-calls
    (bool success, bytes memory response) = token.call(data);

    if (!success) {
      // solhint-disable-next-line no-inline-assembly
      assembly {
        revert(add(response, 32), mload(response))
      }
    }

    CreatedToken storage createdToken = _createdTokens[token];

    createdToken.salt = salt;
    createdToken.variant = variant;

    emit TokenCreated(token, variant, data, block.timestamp);

    return token;
  }
}
