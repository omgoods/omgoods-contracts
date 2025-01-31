// SPDX-License-Identifier: None
pragma solidity 0.8.28;

import {Checkpoints} from "@openzeppelin/contracts/utils/structs/Checkpoints.sol";
import {Time} from "@openzeppelin/contracts/utils/types/Time.sol";
import {StorageSlot} from "@openzeppelin/contracts/utils/StorageSlot.sol";
import {IACTRegistry} from "./interfaces/IACTRegistry.sol";

abstract contract ACTCore {
  // slots

  bytes32 private constant SETTINGS_SLOT =
    keccak256(abi.encodePacked("ACT#settings"));

  bytes32 private constant NAME_SLOT = keccak256(abi.encodePacked("ACT#name"));

  bytes32 private constant SYMBOL_SLOT =
    keccak256(abi.encodePacked("ACT#symbol"));

  bytes32 private constant REGISTRY_SLOT =
    keccak256(abi.encodePacked("ACT#registry"));

  bytes32 private constant MAINTAINER_SLOT =
    keccak256(abi.encodePacked("ACT#maintainer"));

  bytes32 private constant TOTAL_SUPPLY_SLOT =
    keccak256(abi.encodePacked("ACT#totalSupply"));

  bytes32 private constant BALANCE_SLOT =
    keccak256(abi.encodePacked("ACT#balance"));

  bytes32 private constant TOTAL_VOTING_UNITS_SLOT =
    keccak256(abi.encodePacked("ACT#totalVotingUnits"));

  bytes32 private constant VOTING_UNITS_SLOT =
    keccak256(abi.encodePacked("ACT#votingUnits"));

  // enums

  enum Kinds {
    Unknown, // 0
    Fungible, // 1
    NonFungible // 2
  }

  enum Systems {
    Unknown, // 0
    AbsoluteMonarchy, // 1
    ConstitutionalMonarchy, // 2
    Democracy // 3
  }

  // structs

  struct Settings {
    uint8 system;
    bool ready;
    uint48 epochLength;
    uint48 initialEpochTimestamp;
  }

  struct Modules {
    mapping(bytes4 => address) enabled;
  }

  // internal getters

  function _getSettings() internal pure returns (Settings storage result) {
    bytes32 slot = SETTINGS_SLOT;

    assembly ("memory-safe") {
      result.slot := slot
    }

    return result;
  }

  function _getNameSlot()
    internal
    pure
    returns (StorageSlot.StringSlot storage)
  {
    return StorageSlot.getStringSlot(NAME_SLOT);
  }

  function _getSymbolSlot()
    internal
    pure
    returns (StorageSlot.StringSlot storage)
  {
    return StorageSlot.getStringSlot(SYMBOL_SLOT);
  }

  function _getRegistrySlot()
    internal
    pure
    returns (StorageSlot.AddressSlot storage)
  {
    return StorageSlot.getAddressSlot(REGISTRY_SLOT);
  }

  function _getMaintainerSlot()
    internal
    pure
    returns (StorageSlot.AddressSlot storage)
  {
    return StorageSlot.getAddressSlot(MAINTAINER_SLOT);
  }

  function _getTotalSupplySlot()
    internal
    pure
    returns (StorageSlot.Uint256Slot storage)
  {
    return StorageSlot.getUint256Slot(TOTAL_SUPPLY_SLOT);
  }

  function _getBalanceSlot(
    address account
  ) internal pure returns (StorageSlot.Uint256Slot storage) {
    return
      StorageSlot.getUint256Slot(
        keccak256(abi.encodePacked(BALANCE_SLOT, account))
      );
  }

  function _getTotalVotingUnitsSlot()
    internal
    pure
    returns (StorageSlot.Uint256Slot storage)
  {
    return StorageSlot.getUint256Slot(TOTAL_VOTING_UNITS_SLOT);
  }

  function _getVotingUnitsSlot(
    address account
  ) internal pure returns (StorageSlot.Uint256Slot storage) {
    bytes32 slot = keccak256(abi.encodePacked(VOTING_UNITS_SLOT, account));

    return StorageSlot.getUint256Slot(slot);
  }

  function _getOwner() internal view returns (address) {
    return _getOwner(_getSettings());
  }

  function _getOwner(Settings memory settings) internal view returns (address) {
    return
      Systems(settings.system) == Systems.AbsoluteMonarchy
        ? _getMaintainerSlot().value
        : address(this);
  }

  function _getCurrentEpoch() internal view returns (uint48) {
    return _getCurrentEpoch(_getSettings());
  }

  function _getCurrentEpoch(
    Settings memory settings
  ) internal view returns (uint48 result) {
    uint48 initialEpochTimestamp = settings.initialEpochTimestamp;
    uint48 epochLength = settings.epochLength;

    if (initialEpochTimestamp != 0 && epochLength != 0) {
      result = ((Time.timestamp() - initialEpochTimestamp) / epochLength) + 1;
    }

    return result;
  }

  // internal setters

  function _triggerRegistryEvent(bytes memory data) internal {
    _triggerRegistryEvent(_getRegistrySlot().value, data);
  }

  function _triggerRegistryEvent(address registry, bytes memory data) internal {
    if (registry != address(0)) {
      IACTRegistry(registry).emitTokenEvent(data);
    }
  }
}
