// SPDX-License-Identifier: None
pragma solidity 0.8.28;

import {SlotAccess} from "../utils/SlotAccess.sol";
import {ACTSystems} from "./enums/ACTSystems.sol";
import {ACTSettings} from "./structs/ACTSettings.sol";

abstract contract ACTStorage {
  // slots

  bytes32 private constant SLOT_FORWARDER = //
  keccak256(abi.encodePacked("ACT#forwarder"));

  bytes32 private constant SLOT_SETTINGS = //
  keccak256(abi.encodePacked("ACT#settings"));

  bytes32 private constant SLOT_NAME = //
  keccak256(abi.encodePacked("ACT#name"));

  bytes32 private constant SLOT_SYMBOL = //
  keccak256(abi.encodePacked("ACT#symbol"));

  bytes32 private constant SLOT_REGISTRY =
  keccak256(abi.encodePacked("ACT#registry"));

  bytes32 private constant SLOT_MAINTAINER =
  keccak256(abi.encodePacked("ACT#maintainer"));

  bytes32 private constant SLOT_TOTAL_SUPPLY =
  keccak256(abi.encodePacked("ACT#totalSupply"));

  bytes32 private constant SLOT_BALANCE =
  keccak256(abi.encodePacked("ACT#balance"));

  // internal getters

  function _getForwarder() internal virtual view returns (address) {
    return SlotAccess.getAddress(SLOT_FORWARDER);
  }

  function _getSettings() internal pure returns (ACTSettings storage result) {
    bytes32 slot = SLOT_SETTINGS;

    assembly ("memory-safe") {
      result.slot := slot
    }

    return result;
  }

  function _getName() internal view returns (string memory) {
    return SlotAccess.getString(SLOT_NAME);
  }

  function _getSymbol() internal view returns (string memory) {
    return SlotAccess.getString(SLOT_SYMBOL);
  }

  function _getRegistry() internal view returns (address) {
    return SlotAccess.getAddress(SLOT_REGISTRY);
  }

  function _getMaintainer() internal view returns (address) {
    return SlotAccess.getAddress(SLOT_MAINTAINER);
  }

  function _getTotalSupply() internal view returns (uint256) {
    return SlotAccess.getUint256(SLOT_TOTAL_SUPPLY);
  }

  function _getBalance(bytes32 slot) internal view returns (uint256) {
    return SlotAccess.getUint256(slot);
  }

  function _getBalance(address account) internal view returns (uint256) {
    return SlotAccess.getUint256(_hashBalanceSlot(account));
  }

  function _hashBalanceSlot(address account) internal pure returns (bytes32) {
    return keccak256(abi.encodePacked(SLOT_BALANCE, account));
  }

  // internal setters

  function _setForwarder(address forwarder) internal virtual {
    SlotAccess.setAddress(SLOT_FORWARDER, forwarder);
  }

  function _setName(string memory name_) internal {
    return SlotAccess.setString(SLOT_NAME, name_);
  }

  function _setSymbol(string memory symbol_) internal {
    return SlotAccess.setString(SLOT_SYMBOL, symbol_);
  }

  function _setRegistry(address registry) internal {
    SlotAccess.setAddress(SLOT_REGISTRY, registry);
  }

  function _setMaintainer(address maintainer) internal {
    SlotAccess.setAddress(SLOT_MAINTAINER, maintainer);
  }

  function _setTotalSupply(uint256 totalSupply_) internal {
    SlotAccess.setUint256(SLOT_TOTAL_SUPPLY, totalSupply_);
  }

  function _setBalance(bytes32 slot, uint256 balance) internal {
    SlotAccess.setUint256(slot, balance);
  }

  function _setBalance(address account, uint256 balance) internal {
    SlotAccess.setUint256(_hashBalanceSlot(account), balance);
  }
}
