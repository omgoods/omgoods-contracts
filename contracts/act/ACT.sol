// SPDX-License-Identifier: None
pragma solidity 0.8.28;

import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {Time} from "@openzeppelin/contracts/utils/types/Time.sol";
import {StorageSlot} from "@openzeppelin/contracts/utils/StorageSlot.sol";
import {IInitializable} from "../common/interfaces/IInitializable.sol";
import {IOwnable} from "../common/interfaces/IOwnable.sol";
import {Delegatable} from "../common/Delegatable.sol";
import {Epochs} from "../common/Epochs.sol";
import {IACT} from "./interfaces/IACT.sol";
import {ACTCore} from "./ACTCore.sol";
import {ACTEvents} from "./ACTEvents.sol";
import {ACTSystems} from "./enums.sol";
import {ACTSettings} from "./structs.sol";

abstract contract ACT is IInitializable, IOwnable, Delegatable, IACT, ACTCore {
  using ECDSA for bytes32;
  using Epochs for Epochs.Checkpoints;

  // errors

  error AlreadyInReadyState();

  // events

  event NameUpdated(string name);

  event RegistryUpdated(address registry);

  event MaintainerUpdated(address maintainer);

  event SystemUpdated(ACTSystems system);

  event BecameReady();

  // modifiers

  modifier onlyOwnerOrModule() {
    _;
  }

  // deployment

  function initialize(
    address forwarder,
    string calldata name_,
    string calldata symbol_,
    address maintainer,
    bool ready,
    Epochs.Settings memory epochs
  ) external {
    StorageSlot.AddressSlot storage registrySlot = _getRegistrySlot();

    require(registrySlot.value == address(0), AlreadyInitialized());

    registrySlot.value = msg.sender;

    _getForwarderSlot().value = forwarder;
    _getNameSlot().value = name_;
    _getSymbolSlot().value = symbol_;

    ACTSettings storage settings = _getSettings();

    if (maintainer == address(0) || maintainer == address(this)) {
      settings.system = uint8(ACTSystems.Democracy);
      settings.ready = true;
    } else {
      settings.system = uint8(ACTSystems.AbsoluteMonarchy);
      if (ready) {
        settings.ready = ready;
      }
      _getMaintainerSlot().value = maintainer;
    }

    settings.epochs = epochs;
  }

  // external getters

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

  function getOwner() external view returns (address) {
    return _getOwner();
  }

  function getEpoch() external view returns (uint48) {
    return _getEpoch();
  }

  function getTotalSupplyAt(uint48 epoch) external view returns (uint256) {
    return _getTotalSupplyAt(epoch);
  }

  function getBalanceAt(
    uint48 epoch,
    address account
  ) external view returns (uint256) {
    return _getBalanceAt(epoch, account);
  }

  // external setters

  // TODO: add sender verification
  function setName(string calldata name_) external {
    _getNameSlot().value = name_;

    emit NameUpdated(name_);

    _triggerRegistryEvent(abi.encodeCall(ACTEvents.NameUpdated, (name_)));
  }

  // TODO: add sender verification
  function setRegistry(address registry) external {
    StorageSlot.AddressSlot storage registrySlot = _getRegistrySlot();

    address oldRegistry = registrySlot.value;

    if (oldRegistry == registry) {
      // nothing to do
      return;
    }

    registrySlot.value = registry;

    emit RegistryUpdated(registry);

    _triggerRegistryEvent(
      oldRegistry,
      abi.encodeCall(ACTEvents.RegistryUpdated, (registry))
    );

    _triggerRegistryEvent(
      registry,
      abi.encodeCall(ACTEvents.RegistryUpdated, (registry))
    );
  }

  // TODO: add sender verification
  function setMaintainer(address maintainer) external {
    StorageSlot.AddressSlot storage maintainerSlot = _getMaintainerSlot();

    if (maintainerSlot.value == maintainer) {
      // nothing to do
      return;
    }

    maintainerSlot.value = maintainer;

    emit MaintainerUpdated(maintainer);

    _triggerRegistryEvent(
      abi.encodeCall(ACTEvents.MaintainerUpdated, (maintainer))
    );
  }

  // TODO: add sender verification
  function setSystem(ACTSystems system) external {
    ACTSettings storage settings = _getSettings();

    if (ACTSystems(settings.system) == system) {
      // nothing to do
      return;
    }

    settings.system = uint8(system);

    emit SystemUpdated(system);

    _triggerRegistryEvent(abi.encodeCall(ACTEvents.SystemUpdated, (system)));
  }

  // TODO: add sender verification
  function setAsReady() external {
    ACTSettings storage settings = _getSettings();

    require(!settings.ready, AlreadyInReadyState());

    settings.ready = true;

    emit BecameReady();

    _triggerRegistryEvent(abi.encodeCall(ACTEvents.BecameReady, ()));
  }

  // internal setters

  function _saveTotalSupplyHistory(uint48 epoch, uint256 totalSupply) internal {
    if (epoch == 0) {
      return;
    }

    _getTotalSupplyCheckpoints().push(epoch, totalSupply);
  }

  function _saveBalanceHistory(
    address account,
    uint48 epoch,
    uint256 balance
  ) internal {
    if (epoch == 0) {
      return;
    }

    _getBalanceCheckpoints(account).push(epoch, balance);
  }
}
