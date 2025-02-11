// SPDX-License-Identifier: None
pragma solidity 0.8.28;

import {IAccount} from "@account-abstraction/contracts/interfaces/IAccount.sol";
import {PackedUserOperation} from "@account-abstraction/contracts/interfaces/PackedUserOperation.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import {StorageSlot} from "@openzeppelin/contracts/utils/StorageSlot.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {IInitializable} from "../../common/interfaces/IInitializable.sol";
import {IOwnable} from "../../common/interfaces/IOwnable.sol";
import {Address} from "../../common/Address.sol";
import {Epochs} from "../../common/Epochs.sol";
import {ACTCommon} from "../common/ACTCommon.sol";
import {IACTExtension} from "../extensions/interfaces/IACTExtension.sol";
import {ACTSignerExtension} from "../extensions/signer/ACTSignerExtension.sol";
import {IACTRegistry} from "../registry/interfaces/IACTRegistry.sol";
import {IACTAny} from "./interfaces/IACTAny.sol";
import {IACTImpl} from "./interfaces/IACTImpl.sol";
import {IACTPseudoEvents} from "./interfaces/IACTPseudoEvents.sol";

abstract contract ACTImpl is
  IAccount,
  IInitializable,
  IOwnable,
  ACTCommon,
  IACTAny,
  IACTImpl
{
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

  event StateUpdated(States state);

  event GovernanceModelUpdated(GovernanceModels governanceModel);

  event ExtensionUpdated(address extension, bool enabled);

  event ModuleUpdated(address module, ModuleAccess access);

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

  function isInitialized() external view returns (bool) {
    return _getRegistrySlot().value != address(0);
  }

  function getOwner() external view returns (address) {
    return _getOwner(_getMaintainerSlot().value, _getSettings());
  }

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

  function getSettings() external pure returns (Settings memory) {
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

  function getCurrentEpoch() external view returns (uint48) {
    return _getEpoch();
  }

  function isExtensionEnabled(address extension) external view returns (bool) {
    return _getExtensions().enabled[extension];
  }

  function getModuleAccess(
    address module
  ) external view returns (ModuleAccess memory) {
    return _getModules().accesses[module];
  }

  // external setters

  function validateUserOp(
    PackedUserOperation calldata userOp,
    bytes32 userOpHash,
    uint256 missingAccountFunds
  ) external onlyEntryPoint returns (uint256) {
    Settings memory settings = _getSettings();

    if (settings.governanceModel == GovernanceModels.AbsoluteMonarchy) {
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
      abi.encodeCall(ACTSignerExtension.validateSignature, (userOpHash))
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

    _triggerRegistryEvent(
      abi.encodeCall(IACTPseudoEvents.NameUpdated, (name_))
    );

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
      abi.encodeCall(IACTPseudoEvents.MaintainerUpdated, (maintainer))
    );

    return true;
  }

  function setState(States state) external returns (bool) {
    Settings storage settings = _getSettings();

    _requireOnlyOwner(settings);

    States oldState = settings.state;

    if (oldState == state) {
      // nothing to do
      return false;
    }

    require(oldState < state, InvalidState());

    settings.state = state;

    emit StateUpdated(state);

    _triggerRegistryEvent(
      abi.encodeCall(IACTPseudoEvents.StateUpdated, (state))
    );

    return true;
  }

  function setGovernanceModel(
    GovernanceModels governanceModel
  ) external returns (bool) {
    Settings storage settings = _getSettings();

    _requireOnlyOwner(settings);

    if (settings.governanceModel == governanceModel) {
      // nothing to do
      return false;
    }

    settings.governanceModel = governanceModel;

    emit GovernanceModelUpdated(governanceModel);

    _triggerRegistryEvent(
      abi.encodeCall(IACTPseudoEvents.GovernanceModelUpdated, (governanceModel))
    );

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
    Extensions storage extensions = _getExtensions();

    result = enabled
      ? _enableExtension(extensions, extension)
      : _disableExtension(extensions, extension);

    if (result) {
      // Emit an event indicating the extension has been updated
      emit ExtensionUpdated(extension, enabled);

      // Trigger a registry event to notify of the change
      _triggerRegistryEvent(
        registry,
        abi.encodeCall(IACTPseudoEvents.ExtensionUpdated, (extension, enabled))
      );
    }

    return result;
  }

  function setModule(
    address module,
    ModuleAccess memory access
  ) external onlyOwner returns (bool) {
    require(module != address(0), ZeroAddressModule());

    Modules storage modules = _getModules();

    ModuleAccess memory oldAccess = modules.accesses[module];

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
      abi.encodeCall(IACTPseudoEvents.ModuleUpdated, (module, access))
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

    Extensions storage extensions = _getExtensions();

    for (uint256 index; index < len; ) {
      _enableExtension(extensions, extensions_[index]);

      unchecked {
        ++index;
      }
    }
  }

  function _enableExtension(
    Extensions storage extensions,
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
    Extensions storage extensions,
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
