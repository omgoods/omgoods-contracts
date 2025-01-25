// SPDX-License-Identifier: None
pragma solidity 0.8.28;

import {SlotAccess} from "../utils/SlotAccess.sol";
import {ACTSystems} from "./enums.sol";

abstract contract ACTStorage {
  // TODO: add epoch, epoch length, powers

  // slots

  bytes32 private constant SLOT_NAME = //
  keccak256(abi.encodePacked("ACT#name"));

  bytes32 private constant SLOT_SYMBOL = //
  keccak256(abi.encodePacked("ACT#symbol"));

  bytes32 private constant SLOT_REGISTRY =
  keccak256(abi.encodePacked("ACT#registry"));

  bytes32 private constant SLOT_MAINTAINER =
  keccak256(abi.encodePacked("ACT#maintainer"));

  bytes32 private constant SLOT_SYSTEM =
  keccak256(abi.encodePacked("ACT#system"));

  bytes32 private constant SLOT_READY =
  keccak256(abi.encodePacked("ACT#ready"));

  bytes32 private constant SLOT_TOTAL_SUPPLY =
  keccak256(abi.encodePacked("ACT#totalSupply"));

  bytes32 private constant SLOT_BALANCE =
  keccak256(abi.encodePacked("ACT#balance"));

  // internal getters

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

  function _getSystem() internal view returns (ACTSystems) {
    return ACTSystems(SlotAccess.getUint256(SLOT_SYSTEM));
  }

  function _isReady() internal view returns (bool) {
    return SlotAccess.getBool(SLOT_READY);
  }

  function _getTotalSupply() internal view returns (uint256) {
    return SlotAccess.getUint256(SLOT_TOTAL_SUPPLY);
  }

  function _getBalance(address account) internal view returns (uint256) {
    return SlotAccess.getUint256(_getBalanceSlot(account));
  }

  // internal setters

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

  function _setSystem(ACTSystems system) internal {
    SlotAccess.setUint256(SLOT_SYSTEM, uint256(system));
  }

  function _setAsReady() internal {
    SlotAccess.setBool(SLOT_READY, true);
  }

  function _setTotalSupply(uint256 totalSupply_) internal {
    SlotAccess.setUint256(SLOT_TOTAL_SUPPLY, totalSupply_);
  }

  function _setBalance(address account, uint256 balance) internal {
    SlotAccess.setUint256(_getBalanceSlot(account), balance);
  }

  // private getters

  function _getBalanceSlot(address account) private pure returns (bytes32) {
    return keccak256(abi.encodePacked(SLOT_BALANCE, account));
  }
}
