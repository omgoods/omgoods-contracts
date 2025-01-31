// SPDX-License-Identifier: None
pragma solidity 0.8.28;

import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {Checkpoints} from "@openzeppelin/contracts/utils/structs/Checkpoints.sol";
import {Time} from "@openzeppelin/contracts/utils/types/Time.sol";
import {StorageSlot} from "@openzeppelin/contracts/utils/StorageSlot.sol";
import {ForwarderContext} from "../metatx/ForwarderContext.sol";
import {IInitializable} from "../common/interfaces/IInitializable.sol";
import {Delegatable} from "../common/Delegatable.sol";
import {IACT} from "./interfaces/IACT.sol";
import {ACTCore} from "./ACTCore.sol";
import {ACTEvents} from "./ACTEvents.sol";

abstract contract ACT is
  ForwarderContext,
  IInitializable,
  Delegatable,
  IACT,
  ACTCore
{
  using ECDSA for bytes32;
  using Checkpoints for Checkpoints.Trace208;

  // errors

  error AlreadyInReadyState();

  // events

  event NameUpdated(string name);

  event RegistryUpdated(address registry);

  event MaintainerUpdated(address maintainer);

  event SystemUpdated(ACTCore.Systems system);

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
    uint48 epochLength
  ) external {
    StorageSlot.AddressSlot storage registrySlot = _getRegistrySlot();

    require(registrySlot.value == address(0), AlreadyInitialized());

    registrySlot.value = msg.sender;

    _getForwarderSlot().value = forwarder;
    _getNameSlot().value = name_;
    _getSymbolSlot().value = symbol_;

    ACTCore.Settings storage settings = _getSettings();

    if (maintainer == address(0) || maintainer == address(this)) {
      settings.system = uint8(ACTCore.Systems.Democracy);
    } else {
      settings.system = uint8(ACTCore.Systems.AbsoluteMonarchy);
      _getMaintainerSlot().value = maintainer;
    }

    if (ready) {
      settings.ready = true;
    }

    settings.epochLength = epochLength;
    settings.initialEpochTimestamp = Time.timestamp();
  }

  // external getters

  function isInitialized() external view returns (bool) {
    return _getRegistrySlot().value != address(0);
  }

  function getSettings() external pure returns (ACTCore.Settings memory) {
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

  function getTotalVotingUnits() external view returns (uint256) {
    return _getTotalVotingUnitsSlot().value;
  }

  function getVotingUnits(address account) external view returns (uint256) {
    return _getVotingUnitsSlot(account).value;
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
  function setSystem(ACTCore.Systems system) external {
    ACTCore.Settings storage settings = _getSettings();

    if (ACTCore.Systems(settings.system) == system) {
      // nothing to do
      return;
    }

    settings.system = uint8(system);

    emit SystemUpdated(system);

    _triggerRegistryEvent(abi.encodeCall(ACTEvents.SystemUpdated, (system)));
  }

  // TODO: add sender verification
  function setAsReady() external {
    ACTCore.Settings storage settings = _getSettings();

    require(!settings.ready, AlreadyInReadyState());

    settings.ready = true;

    emit BecameReady();

    _triggerRegistryEvent(abi.encodeCall(ACTEvents.BecameReady, ()));
  }

  // internal setters

  function _transferVotingUnits(
    address from,
    address to,
    uint256 value
  ) internal {
    if (value == 0) {
      return;
    }

    if (from == address(0)) {
      _getTotalVotingUnitsSlot().value += value;
    } else {
      StorageSlot.Uint256Slot storage fromVotingUnitsSlot = _getVotingUnitsSlot(
        from
      );

      uint256 fromVotingUnits = fromVotingUnitsSlot.value;

      if (fromVotingUnits == 0) {
        return;
      }

      if (fromVotingUnits < value) {
        value = fromVotingUnits;
      }

      unchecked {
        fromVotingUnitsSlot.value = fromVotingUnits - value;
      }
    }

    unchecked {
      if (to == address(0)) {
        _getTotalVotingUnitsSlot().value -= value;
      } else {
        _getVotingUnitsSlot(to).value += value;
      }
    }
  }
}
