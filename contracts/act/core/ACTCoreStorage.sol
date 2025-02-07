// SPDX-License-Identifier: None
pragma solidity 0.8.28;

import {StorageSlot} from "@openzeppelin/contracts/utils/StorageSlot.sol";
import {Epochs} from "../../common/Epochs.sol";
import {ACTSettings, ACTExtensions, ACTModules} from "./structs.sol";

abstract contract ACTCoreStorage {
  // slots

  bytes32 private constant NONCE_SLOT =
    keccak256(abi.encodePacked("act.core#nonce"));

  bytes32 private constant REGISTRY_SLOT =
    keccak256(abi.encodePacked("act.core#registry"));

  bytes32 private constant ENTRY_POINT_SLOT =
    keccak256(abi.encodePacked("act.core#entryPoint"));

  bytes32 private constant MAINTAINER_SLOT =
    keccak256(abi.encodePacked("act.core#maintainer"));

  bytes32 private constant NAME_SLOT =
    keccak256(abi.encodePacked("act.core#name"));

  bytes32 private constant SYMBOL_SLOT =
    keccak256(abi.encodePacked("act.core#symbol"));

  bytes32 private constant SETTINGS_SLOT =
    keccak256(abi.encodePacked("act.core#settings"));

  bytes32 private constant TOTAL_SUPPLY_SLOT =
    keccak256(abi.encodePacked("act.core#totalSupply"));

  bytes32 private constant TOTAL_SUPPLY_CHECKPOINTS_SLOT =
    keccak256(abi.encodePacked("act.core#totalSupplyCheckpoints"));

  bytes32 private constant BALANCE_SLOT =
    keccak256(abi.encodePacked("act.core#balance"));

  bytes32 private constant BALANCE_CHECKPOINTS_SLOT =
    keccak256(abi.encodePacked("act.core#balanceCheckpoints"));

  bytes32 private constant EXTENSIONS_SLOT =
    keccak256(abi.encodePacked("act.core#extensions"));

  bytes32 private constant MODULES_SLOT =
    keccak256(abi.encodePacked("act.core#modules"));

  // internal getters

  function _getNonceSlot(
    address account
  ) internal pure returns (StorageSlot.Uint256Slot storage) {
    return
      StorageSlot.getUint256Slot(
        keccak256(abi.encodePacked(NONCE_SLOT, account))
      );
  }

  function _getRegistrySlot()
    internal
    pure
    returns (StorageSlot.AddressSlot storage)
  {
    return StorageSlot.getAddressSlot(REGISTRY_SLOT);
  }

  function _getEntryPointSlot()
    internal
    pure
    returns (StorageSlot.AddressSlot storage)
  {
    return StorageSlot.getAddressSlot(ENTRY_POINT_SLOT);
  }

  function _getMaintainerSlot()
    internal
    pure
    returns (StorageSlot.AddressSlot storage)
  {
    return StorageSlot.getAddressSlot(MAINTAINER_SLOT);
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

  function _getSettings() internal pure returns (ACTSettings storage result) {
    bytes32 slot = SETTINGS_SLOT;

    // solhint-disable-next-line no-inline-assembly
    assembly ("memory-safe") {
      result.slot := slot
    }

    return result;
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
