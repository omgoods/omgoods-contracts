// SPDX-License-Identifier: None
pragma solidity 0.8.28;

import {StorageSlot} from "@openzeppelin/contracts/utils/StorageSlot.sol";
import {Epochs} from "../common/Epochs.sol";
import {ACTSettings, ACTExtensions, ACTModules} from "./structs.sol";

abstract contract ACTStorage {
  // slots

  bytes32 private constant FORWARDER_SLOT =
    keccak256(abi.encodePacked("ACT#forwarder"));

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

  bytes32 private constant TOTAL_SUPPLY_CHECKPOINTS_SLOT =
    keccak256(abi.encodePacked("ACT#totalSupplyCheckpoints"));

  bytes32 private constant BALANCE_SLOT =
    keccak256(abi.encodePacked("ACT#balance"));

  bytes32 private constant BALANCE_CHECKPOINTS_SLOT =
    keccak256(abi.encodePacked("ACT#balanceCheckpoints"));

  bytes32 private constant EXTENSIONS_SLOT =
    keccak256(abi.encodePacked("ACT#extensions"));

  bytes32 private constant MODULES_SLOT =
    keccak256(abi.encodePacked("ACT#modules"));

  // internal getters

  function _getForwarderSlot()
    internal
    pure
    returns (StorageSlot.AddressSlot storage)
  {
    return StorageSlot.getAddressSlot(FORWARDER_SLOT);
  }

  function _getSettings() internal pure returns (ACTSettings storage result) {
    bytes32 slot = SETTINGS_SLOT;

    // solhint-disable-next-line no-inline-assembly
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

  function _getTotalSupplyCheckpoints()
    internal
    pure
    returns (Epochs.Checkpoints storage result)
  {
    bytes32 slot = TOTAL_SUPPLY_CHECKPOINTS_SLOT;

    // solhint-disable-next-line no-inline-assembly
    assembly ("memory-safe") {
      result.slot := slot
    }

    return result;
  }

  function _getBalanceSlot(
    address account
  ) internal pure returns (StorageSlot.Uint256Slot storage) {
    return
      StorageSlot.getUint256Slot(
        keccak256(abi.encodePacked(BALANCE_SLOT, account))
      );
  }

  function _getBalanceCheckpoints(
    address account
  ) internal pure returns (Epochs.Checkpoints storage result) {
    bytes32 slot = keccak256(
      abi.encodePacked(BALANCE_CHECKPOINTS_SLOT, account)
    );

    // solhint-disable-next-line no-inline-assembly
    assembly ("memory-safe") {
      result.slot := slot
    }

    return result;
  }

  function _getExtensions()
    internal
    pure
    returns (ACTExtensions storage result)
  {
    bytes32 slot = EXTENSIONS_SLOT;

    // solhint-disable-next-line no-inline-assembly
    assembly ("memory-safe") {
      result.slot := slot
    }

    return result;
  }

  function _getModules() internal pure returns (ACTModules storage result) {
    bytes32 slot = MODULES_SLOT;

    // solhint-disable-next-line no-inline-assembly
    assembly ("memory-safe") {
      result.slot := slot
    }

    return result;
  }
}
