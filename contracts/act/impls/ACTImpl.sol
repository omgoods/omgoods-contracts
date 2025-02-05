// SPDX-License-Identifier: None
pragma solidity 0.8.28;

import {StorageSlot} from "@openzeppelin/contracts/utils/StorageSlot.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {IInitializable} from "../../common/interfaces/IInitializable.sol";
import {Delegatable} from "../../common/Delegatable.sol";
import {Epochs} from "../../common/Epochs.sol";
import {ACTCore} from "../core/ACTCore.sol";
import {ACTStates, ACTSystems} from "../core/enums.sol";
import {ACTSettings, ACTExtensions, ACTModules, ACTModuleAccess} from "../core/structs.sol";
import {IACTExtension} from "../extensions/interfaces/IACTExtension.sol";
import {IACT} from "../interfaces/IACT.sol";
import {IACTRegistry} from "../registry/interfaces/IACTRegistry.sol";
import {IACTImpl} from "./interfaces/IACTImpl.sol";
import {ACTEvents} from "./ACTEvents.sol";

/**
 * @title ACTImpl
 */
abstract contract ACTImpl is
  IInitializable,
  Delegatable,
  ACTCore,
  IACT,
  IACTImpl
{
  using Epochs for Epochs.Checkpoints;

  // errors

  error AlreadyInReadyState();

  error InvalidState();

  error ZeroAddressMaintainer();

  error ZeroAddressModule();

  error ZeroAddressExtension();

  error UnsupportedExtension();

  error ExtensionNotFound();

  // events

  event NameUpdated(string name);

  event MaintainerUpdated(address maintainer);

  event StateUpdated(ACTStates state);

  event SystemUpdated(ACTSystems system);

  event ExtensionUpdated(address extension, bool enabled);

  event ModuleUpdated(address module, ACTModuleAccess access);

  // deployment

  constructor() {
    _getRegistrySlot().value = msg.sender;
  }

  function initialize(
    address forwarder,
    string calldata name_,
    string calldata symbol_,
    address maintainer,
    Epochs.Settings memory epochSettings
  ) external {
    StorageSlot.AddressSlot storage registrySlot = _getRegistrySlot();

    require(registrySlot.value == address(0), AlreadyInitialized());

    require(maintainer != address(0), ZeroAddressMaintainer());

    registrySlot.value = msg.sender;

    _getForwarderSlot().value = forwarder;
    _getNameSlot().value = name_;
    _getSymbolSlot().value = symbol_;
    _getMaintainerSlot().value = maintainer;
    _getSettings().epochs = epochSettings;
  }

  // receive

  receive() external payable {
    //
  }

  // solhint-disable-next-line no-complex-fallback
  fallback() external payable {
    address extension = _getExtensions().selectors[msg.sig];

    require(extension != address(0), ExtensionNotFound());

    _delegate(extension);
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

  function totalSupplyAt(uint48 epoch) external view returns (uint256) {
    return _getTotalSupplyAt(epoch, _getEpoch());
  }

  function balanceOf(address account) external view returns (uint256) {
    return _getBalanceSlot(account).value;
  }

  function balanceAt(
    uint48 epoch,
    address account
  ) external view returns (uint256) {
    return _getBalanceAt(epoch, _getEpoch(), account);
  }

  function getOwner() external view returns (address) {
    return _getOwner(_getMaintainerSlot().value, _getSettings());
  }

  function isInitialized() external view returns (bool) {
    return _getRegistrySlot().value != address(0);
  }

  function getSettings() external pure returns (ACTSettings memory) {
    return _getSettings();
  }

  function getRegistry() external view returns (address) {
    return _getRegistrySlot().value;
  }

  function getMaintainer() external view returns (address) {
    return _getMaintainerSlot().value;
  }

  function getCurrentEpoch() external view returns (uint48) {
    return _getEpoch();
  }

  // external setters

  function setName(string calldata name_) external onlyOwner returns (bool) {
    StorageSlot.StringSlot storage nameSlot = _getNameSlot();

    if (Strings.equal(nameSlot.value, name_)) {
      // nothing to do
      return false;
    }

    nameSlot.value = name_;

    emit NameUpdated(name_);

    _triggerRegistryEvent(abi.encodeCall(ACTEvents.NameUpdated, (name_)));

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
      abi.encodeCall(ACTEvents.MaintainerUpdated, (maintainer))
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

    _triggerRegistryEvent(abi.encodeCall(ACTEvents.StateUpdated, (state)));

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

    _triggerRegistryEvent(abi.encodeCall(ACTEvents.SystemUpdated, (system)));

    return true;
  }

  function setExtension(
    address extension,
    bool enabled
  ) external onlyOwner returns (bool) {
    require(extension != address(0), ZeroAddressExtension());

    address registry = _getRegistrySlot().value;

    require(
      IACTRegistry(registry).isExtensionEnabled(extension),
      UnsupportedExtension()
    );

    // Retrieve the function selectors supported by the given extension
    bytes4[] memory selectors = IACTExtension(extension)
      .getSupportedSelectors();

    // Access the storage for managing extensions
    ACTExtensions storage extensions = _getExtensions();

    // Check if the extension's enabled status is already set to the desired value
    if (extensions.enabled[extension] == enabled) {
      // nothing to do
      return false;
    }

    // Update the enabled status of the extension
    extensions.enabled[extension] = enabled;

    // Determine the address to assign to the selectors (either the extension or a null address)
    uint256 len = selectors.length;
    address target = enabled ? extension : address(0);

    // Iterate through all selectors and update their mapped target
    for (uint256 index; index < len; ) {
      extensions.selectors[selectors[index]] = target;

      // Increment index without overflow checks
      unchecked {
        index += 1;
      }
    }

    // Emit an event indicating the extension has been updated
    emit ExtensionUpdated(extension, enabled);

    // Trigger a registry event to notify of the change
    _triggerRegistryEvent(
      registry,
      abi.encodeCall(ACTEvents.ExtensionUpdated, (extension, enabled))
    );

    return true;
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
      abi.encodeCall(ACTEvents.ModuleUpdated, (module, access))
    );

    return true;
  }
}
