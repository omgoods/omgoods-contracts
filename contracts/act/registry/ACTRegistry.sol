// SPDX-License-Identifier: None
pragma solidity 0.8.28;

import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";
import {Epochs} from "../../common/Epochs.sol";
import {Guarded} from "../../common/Guarded.sol";
import {Initializable} from "../../common/Initializable.sol";
import {ForwarderContext} from "../../metatx/ForwarderContext.sol";
import {IACTImpl} from "../impls/interfaces/IACTImpl.sol";
import {IACTRegistry} from "./interfaces/IACTRegistry.sol";

contract ACTRegistry is Guarded, Initializable, ForwarderContext, IACTRegistry {
  // enums

  enum Variants {
    Fungible, // 0
    NonFungible // 1
  }

  // storage

  Epochs.Settings private _epochsSettings;

  mapping(Variants variant => address impl) private _variantsImpls;

  mapping(address extension => bool active) private _activeExtensions;

  mapping(address token => bytes32 salt) private _tokensSalts;

  // errors

  error MsgSenderIsNotAToken();

  error ZeroAddressVariantImpl();

  error ZeroAddressExtension();

  error InvalidVariant();

  // events

  event TokenEvent(address token, bytes data, uint256 timestamp);

  event TokenCreated(
    address token,
    address impl,
    bytes data,
    uint256 timestamp
  );

  event VariantUpdated(Variants variant, address impl);

  event ExtensionUpdated(address extension, bool active);

  // modifiers

  modifier onlyToken() {
    require(_isTokenCreated(msg.sender), MsgSenderIsNotAToken());

    _;
  }

  // deployment

  /**
   * @notice Constructor for the ACTRegistry contract.
   * @dev Initializes the contract with an initializer address.
   * @param initializer The address that will be used to initialize the contract.
   */
  constructor(address initializer) Initializable(initializer) {
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

  function getEpochSettings() external view returns (Epochs.Settings memory) {
    return _epochsSettings;
  }

  function getEpoch() external view returns (uint48) {
    return Epochs.calcEpoch(_epochsSettings);
  }

  function getVariantImpl(Variants variant) external view returns (address) {
    return _variantsImpls[variant];
  }

  function isExtensionActive(address extension) external view returns (bool) {
    return _activeExtensions[extension];
  }

  function computeTokenAddress(
    Variants variant,
    string calldata symbol
  ) external view returns (address) {
    return _computeTokenAddress(variant, symbol);
  }

  function isTokenCreated(address token) external view returns (bool) {
    return _isTokenCreated(token);
  }

  // external setters

  function setVariant(
    Variants variant,
    address impl
  ) external onlyOwner returns (bool) {
    require(impl != address(0), ZeroAddressVariantImpl());

    if (_variantsImpls[variant] == impl) {
      // nothing to do
      return false;
    }

    _variantsImpls[variant] = impl;

    emit VariantUpdated(variant, impl);

    return true;
  }

  function setExtension(
    address extension,
    bool active
  ) external onlyOwner returns (bool) {
    require(extension != address(0), ZeroAddressExtension());

    if (_activeExtensions[extension] == active) {
      // nothing to do
      return false;
    }

    _activeExtensions[extension] = active;

    emit ExtensionUpdated(extension, active);

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

  function emitTokenEvent(bytes calldata data) external onlyToken {
    emit TokenEvent(msg.sender, data, block.timestamp);
  }

  // private getters

  function _computeTokenSalt(
    string calldata symbol
  ) private pure returns (bytes32) {
    return keccak256(abi.encodePacked(symbol));
  }

  function _computeTokenAddress(
    Variants variant,
    string calldata symbol
  ) private view returns (address result) {
    address impl = _variantsImpls[variant];

    if (impl != address(0)) {
      result = Clones.predictDeterministicAddress(
        impl,
        _computeTokenSalt(symbol),
        address(this)
      );
    }

    return result;
  }

  function _isTokenCreated(address token) internal view returns (bool) {
    return _tokensSalts[token] != bytes32(0);
  }

  // private setters

  function _createToken(
    Variants variant,
    string calldata name,
    string calldata symbol,
    address maintainer
  ) private returns (address token) {
    address impl = _variantsImpls[variant];

    require(impl != address(0), InvalidVariant());

    bytes32 salt = _computeTokenSalt(symbol);

    token = Clones.cloneDeterministic(impl, salt);

    bytes memory data = abi.encodeCall(
      IACTImpl.initialize,
      (_getForwarder(), name, symbol, maintainer, _epochsSettings)
    );

    // solhint-disable-next-line avoid-low-level-calls
    (bool success, bytes memory response) = token.call(data);

    if (!success) {
      // solhint-disable-next-line no-inline-assembly
      assembly {
        revert(add(response, 32), mload(response))
      }
    }

    _tokensSalts[token] = salt;

    emit TokenCreated(token, impl, data, block.timestamp);

    return token;
  }
}
