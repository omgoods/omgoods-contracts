// SPDX-License-Identifier: None
pragma solidity 0.8.28;

import {PackedUserOperation} from "@account-abstraction/contracts/interfaces/PackedUserOperation.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import {StorageSlot} from "@openzeppelin/contracts/utils/StorageSlot.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {IInitializable} from "../../common/interfaces/IInitializable.sol";
import {Address} from "../../common/Address.sol";
import {Epochs} from "../../common/Epochs.sol";
import {ACTCore} from "../core/ACTCore.sol";
import {ACTStates, ACTSystems} from "../core/enums.sol";
import {ACTSettings, ACTExtensions, ACTModules, ACTModuleAccess} from "../core/structs.sol";
import {IACTExtension} from "../extensions/interfaces/IACTExtension.sol";
import {IACTSigner} from "../extensions/signer/interfaces/IACTSigner.sol";
import {IACTCommon} from "./interfaces/IACTCommon.sol";
import {IACTRegistry} from "../registry/interfaces/IACTRegistry.sol";
import {IACTEvents} from "./interfaces/IACTEvents.sol";
import {IACTImpl} from "./interfaces/IACTImpl.sol";

/**
 * @title ACTImpl
 */
abstract contract ACTImpl is IInitializable, ACTCore, IACTCommon, IACTImpl {
  using ECDSA for bytes32;
  using MessageHashUtils for bytes32;
  using Address for address;
  using Epochs for Epochs.Checkpoints;

  // errors

  error AlreadyInReadyState();

  error InvalidState();

  error ZeroAddressMaintainer();

  error ZeroAddressModule();

  error ZeroAddressExtension();

  error UnsupportedExtension();

  error InvalidNonce();

  // events

  event NameUpdated(string name);

  event MaintainerUpdated(address maintainer);

  event StateUpdated(ACTStates state);

  event SystemUpdated(ACTSystems system);

  event ExtensionUpdated(address extension, bool enabled);

  event ModuleUpdated(address module, ACTModuleAccess access);

  // deployment

  constructor() {
    _getRegistrySlot().value = address(this); // singleton
  }

  function initialize(
    address entryPoint,
    address maintainer,
    string calldata name_,
    string calldata symbol_,
    address[] calldata extensions_,
    Epochs.Settings memory epochSettings
  ) external {
    StorageSlot.AddressSlot storage registrySlot = _getRegistrySlot();

    require(registrySlot.value == address(0), AlreadyInitialized());

    require(maintainer != address(0), ZeroAddressMaintainer());

    registrySlot.value = msg.sender;

    _getEntryPointSlot().value = entryPoint;
    _getMaintainerSlot().value = maintainer;
    _getNameSlot().value = name_;
    _getSymbolSlot().value = symbol_;
    _getSettings().epochs = epochSettings;

    _enableExtensions(extensions_);
  }

  // receive

  receive() external payable {
    //
  }

  // solhint-disable-next-line no-complex-fallback
  fallback() external payable {
    _callExtension();
  }

  // external getters

  function name() external view returns (string memory) {
    return _getNameSlot().value;
  }

  function symbol() external view returns (string memory) {
    return _getSymbolSlot().value;
  }

  function totalSupply() external view returns (uint256) {
    return _getTotalSupplySlot().value;
  }

  function balanceOf(address account) external view returns (uint256) {
    return _getBalanceSlot(account).value;
  }

  function getNonce() external view returns (uint256) {
    return _getNonceSlot(address(this)).value;
  }

  function getNonce(address account) external view returns (uint256) {
    return _getNonceSlot(account).value;
  }

  function getRegistry() external view returns (address) {
    return _getRegistrySlot().value;
  }

  function getEntryPoint() external view returns (address) {
    return _getEntryPointSlot().value;
  }

  function getMaintainer() external view returns (address) {
    return _getMaintainerSlot().value;
  }

  function getOwner() external view returns (address) {
    return _getOwner(_getMaintainerSlot().value, _getSettings());
  }

  function getSettings() external pure returns (ACTSettings memory) {
    return _getSettings();
  }

  function getTotalSupplyAt(uint48 epoch) external view returns (uint256) {
    return _getTotalSupplyAt(epoch, _getEpoch());
  }

  function getBalanceAt(
    uint48 epoch,
    address account
  ) external view returns (uint256) {
    return _getBalanceAt(epoch, _getEpoch(), account);
  }

  function isInitialized() external view returns (bool) {
    return _getRegistrySlot().value != address(0);
  }

  function getCurrentEpoch() external view returns (uint48) {
    return _getEpoch();
  }

  // external setters

  function validateUserOp(
    PackedUserOperation calldata userOp,
    bytes32 userOpHash,
    uint256 missingAccountFunds
  ) external onlyEntryPoint returns (uint256) {
    ACTSettings memory settings = _getSettings();

    if (settings.system == ACTSystems.AbsoluteMonarchy) {
      (address recovered, , ) = userOpHash.toEthSignedMessageHash().tryRecover(
        userOp.signature
      );

      if (recovered != address(0)) {
        address maintainer = _getMaintainerSlot().value;

        if (maintainer == recovered) {
          _validateNonce(userOp.nonce, maintainer);

          msg.sender.makeRefundCall(missingAccountFunds);

          return 0;
        }
      }
    }

    _validateNonce(userOp.nonce, address(this));

    bytes memory encodedData = _callExtension(
      abi.encodeCall(IACTSigner.validateSignature, (userOpHash))
    );

    return abi.decode(encodedData, (uint256));
  }

  function setName(string calldata name_) external onlyOwner returns (bool) {
    StorageSlot.StringSlot storage nameSlot = _getNameSlot();

    if (Strings.equal(nameSlot.value, name_)) {
      // nothing to do
      return false;
    }

    nameSlot.value = name_;

    emit NameUpdated(name_);

    _triggerRegistryEvent(abi.encodeCall(IACTEvents.NameUpdated, (name_)));

    return true;
  }

  function setMaintainer(address maintainer) external returns (bool) {
    require(maintainer != address(0), ZeroAddressMaintainer());

    StorageSlot.AddressSlot storage maintainerSlot = _getMaintainerSlot();

    address oldMaintainer = maintainerSlot.value;

    _requireOnlyOwnerOrMaintainer(oldMaintainer);

    if (oldMaintainer == maintainer) {
      // nothing to do
      return false;
    }

    maintainerSlot.value = maintainer;

    emit MaintainerUpdated(maintainer);

    _triggerRegistryEvent(
      abi.encodeCall(IACTEvents.MaintainerUpdated, (maintainer))
    );

    return true;
  }

  function setState(ACTStates state) external returns (bool) {
    ACTSettings storage settings = _getSettings();

    _requireOnlyOwner(settings);

    ACTStates oldState = settings.state;

    if (oldState == state) {
      // nothing to do
      return false;
    }

    require(oldState < state, InvalidState());

    settings.state = state;

    emit StateUpdated(state);

    _triggerRegistryEvent(abi.encodeCall(IACTEvents.StateUpdated, (state)));

    return true;
  }

  function setSystem(ACTSystems system) external returns (bool) {
    ACTSettings storage settings = _getSettings();

    _requireOnlyOwner(settings);

    if (settings.system == system) {
      // nothing to do
      return false;
    }

    settings.system = system;

    emit SystemUpdated(system);

    _triggerRegistryEvent(abi.encodeCall(IACTEvents.SystemUpdated, (system)));

    return true;
  }

  function setExtension(
    address extension,
    bool enabled
  ) external onlyOwner returns (bool result) {
    require(extension != address(0), ZeroAddressExtension());

    address registry = _getRegistrySlot().value;

    require(
      IACTRegistry(registry).isExtensionEnabled(extension),
      UnsupportedExtension()
    );

    // Access the storage for managing extensions
    ACTExtensions storage extensions = _getExtensions();

    result = enabled
      ? _enableExtension(extensions, extension)
      : _disableExtension(extensions, extension);

    if (result) {
      // Emit an event indicating the extension has been updated
      emit ExtensionUpdated(extension, enabled);

      // Trigger a registry event to notify of the change
      _triggerRegistryEvent(
        registry,
        abi.encodeCall(IACTEvents.ExtensionUpdated, (extension, enabled))
      );
    }

    return result;
  }

  function setModule(
    address module,
    ACTModuleAccess memory access
  ) external onlyOwner returns (bool) {
    require(module != address(0), ZeroAddressModule());

    ACTModules storage modules = _getModules();

    ACTModuleAccess memory oldAccess = modules.accesses[module];

    if (
      oldAccess.isMinter == access.isMinter &&
      oldAccess.isBurner == access.isBurner &&
      oldAccess.isOperator == access.isOperator
    ) {
      // nothing to do
      return false;
    }

    modules.accesses[module] = access;

    emit ModuleUpdated(module, access);

    _triggerRegistryEvent(
      abi.encodeCall(IACTEvents.ModuleUpdated, (module, access))
    );

    return true;
  }

  // private setters

  function _validateNonce(uint256 nonce, address account) private {
    StorageSlot.Uint256Slot storage nonceSlot = _getNonceSlot(account);

    require(nonceSlot.value == nonce, InvalidNonce());

    unchecked {
      nonceSlot.value = nonce + 1;
    }
  }

  function _enableExtensions(address[] calldata extensions_) private {
    uint256 len = extensions_.length;

    if (len == 0) {
      return;
    }

    ACTExtensions storage extensions = _getExtensions();

    for (uint256 index; index < len; ) {
      _enableExtension(extensions, extensions_[index]);

      unchecked {
        ++index;
      }
    }
  }

  function _enableExtension(
    ACTExtensions storage extensions,
    address extension
  ) private returns (bool) {
    // Retrieve the function selectors supported by the given extension
    bytes4[] memory selectors = IACTExtension(extension)
      .getSupportedSelectors();

    if (extensions.enabled[extension]) {
      // nothing to do
      return false;
    }

    extensions.enabled[extension] = true;

    uint256 len = selectors.length;

    for (uint256 index; index < len; ) {
      extensions.selectors[selectors[index]] = extension;

      unchecked {
        ++index;
      }
    }

    return true;
  }

  function _disableExtension(
    ACTExtensions storage extensions,
    address extension
  ) private returns (bool) {
    // Retrieve the function selectors supported by the given extension
    bytes4[] memory selectors = IACTExtension(extension)
      .getSupportedSelectors();

    if (!extensions.enabled[extension]) {
      // nothing to do
      return false;
    }

    extensions.enabled[extension] = false;

    uint256 len = selectors.length;

    for (uint256 index; index < len; ) {
      bytes4 selector = selectors[index];

      if (extensions.selectors[selector] == extension) {
        delete extensions.selectors[selector];
      }

      unchecked {
        ++index;
      }
    }

    return true;
  }
}
