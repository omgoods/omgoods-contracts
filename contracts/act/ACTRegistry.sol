// SPDX-License-Identifier: None
pragma solidity 0.8.28;

import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";
import {Epochs} from "../common/Epochs.sol";
import {Initializable} from "../common/Initializable.sol";
import {Guarded} from "../common/Guarded.sol";
import {ForwarderContext} from "../metatx/ForwarderContext.sol";
import {IACT} from "./interfaces/IACT.sol";
import {IACTRegistry} from "./interfaces/IACTRegistry.sol";
import {ACTVariants} from "./enums.sol";

contract ACTRegistry is Initializable, Guarded, ForwarderContext, IACTRegistry {
  // storage

  Epochs.Settings private _epochsSettings;

  mapping(ACTVariants variant => address variantImpl) private _tokenVariants;

  mapping(address token => bytes32 salt) private _tokensSalts;

  mapping(address extension => bool active) private _extensions;

  // errors

  /**
   * @dev Reverts when the sender is not a registered token in the contract.
   */
  error MsgSenderIsNotAToken();

  /**
   * @dev Reverts when attempting to create a token that already exists.
   */
  error ZeroAddressTokenVariantImpl();

  error ZeroAddressExtension();

  error InvalidTokenVariant();

  // events

  event TokenEvent(address token, bytes data, uint256 timestamp);

  event TokenCreated(
    address token,
    address impl,
    bytes data,
    uint256 timestamp
  );

  event TokenVariantUpdated(ACTVariants variant, address variantImpl);

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

  function getTokenVariantImpl(
    ACTVariants variant
  ) external view returns (address) {
    return _tokenVariants[variant];
  }

  function computeTokenAddress(
    ACTVariants variant,
    string calldata symbol
  ) external view returns (address) {
    return _computeTokenAddress(variant, symbol);
  }

  function isTokenCreated(address token) external view returns (bool) {
    return _isTokenCreated(token);
  }

  function isExtensionActive(address extension) external view returns (bool) {
    return _extensions[extension];
  }

  // external setters

  function setTokenVariant(
    ACTVariants variant,
    address variantImpl
  ) external onlyOwner returns (bool) {
    require(variantImpl != address(0), ZeroAddressTokenVariantImpl());

    if (_tokenVariants[variant] == variantImpl) {
      // nothing to do
      return false;
    }

    _tokenVariants[variant] = variantImpl;

    emit TokenVariantUpdated(variant, variantImpl);

    return true;
  }

  function createToken(
    ACTVariants variant,
    string calldata name,
    string calldata symbol,
    address maintainer
  ) external onlyOwner returns (address) {
    return _createToken(variant, name, symbol, maintainer);
  }

  /**
   * @notice Emits a `TokenEvent` for a token-related action or update.
   * @dev This function can only be called by a registered token via the `onlyToken` modifier.
   * @param data Additional data to be included in the emitted event.
   */
  function emitTokenEvent(bytes calldata data) external onlyToken {
    emit TokenEvent(msg.sender, data, block.timestamp);
  }

  function setExtension(
    address extension,
    bool active
  ) external onlyOwner returns (bool) {
    require(extension != address(0), ZeroAddressExtension());

    if (_extensions[extension] == active) {
      // nothing to do
      return false;
    }

    _extensions[extension] = active;

    emit ExtensionUpdated(extension, active);

    return true;
  }

  // private getters

  function _computeTokenSalt(
    string calldata symbol
  ) private pure returns (bytes32) {
    return keccak256(abi.encodePacked(symbol));
  }

  function _computeTokenAddress(
    ACTVariants variant,
    string calldata symbol
  ) private view returns (address result) {
    address variantImpl = _tokenVariants[variant];

    if (variantImpl != address(0)) {
      result = Clones.predictDeterministicAddress(
        variantImpl,
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
    ACTVariants variant,
    string calldata name,
    string calldata symbol,
    address maintainer
  ) private returns (address token) {
    address variantImpl = _tokenVariants[variant];

    require(variantImpl != address(0), InvalidTokenVariant());

    bytes32 salt = _computeTokenSalt(symbol);

    token = Clones.cloneDeterministic(variantImpl, salt);

    bytes memory data = abi.encodeCall(
      IACT.initialize,
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

    emit TokenCreated(token, variantImpl, data, block.timestamp);

    return token;
  }
}
