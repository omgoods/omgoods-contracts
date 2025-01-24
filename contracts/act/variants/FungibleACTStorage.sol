// SPDX-License-Identifier: None
pragma solidity 0.8.28;

import {SlotAccess} from "../../utils/SlotAccess.sol";
import {ACTStorage} from "../ACTStorage.sol";

abstract contract FungibleACTStorage is ACTStorage {
  bytes32 private constant SLOT_TOTAL_SUPPLY =
    keccak256(abi.encodePacked("FungibleACT#totalSupply"));

  bytes32 private constant SLOT_BALANCE =
    keccak256(abi.encodePacked("FungibleACT#balance"));

  bytes32 private constant SLOT_ALLOWANCE =
    keccak256(abi.encodePacked("FungibleACT#allowance"));

  // internal getters

  function _getTotalSupply() internal view returns (uint256) {
    return SlotAccess.getUint256(SLOT_TOTAL_SUPPLY);
  }

  function _getAllowance(
    address owner,
    address spender
  ) internal view returns (uint256) {
    return SlotAccess.getUint256(_getAllowanceSlot(owner, spender));
  }

  function _getBalance(address account) internal view returns (uint256) {
    return SlotAccess.getUint256(_getBalanceSlot(account));
  }

  function _getAllowanceSlot(
    address owner,
    address spender
  ) private pure returns (bytes32) {
    return keccak256(abi.encodePacked(SLOT_BALANCE, owner, spender));
  }

  function _getBalanceSlot(address account) private pure returns (bytes32) {
    return keccak256(abi.encodePacked(SLOT_BALANCE, account));
  }

  // internal setters

  function _setTotalSupply(uint256 totalSupply_) internal {
    SlotAccess.setUint256(SLOT_TOTAL_SUPPLY, totalSupply_);
  }

  function _setAllowance(
    address owner,
    address spender,
    uint256 allowance_
  ) internal {
    SlotAccess.setUint256(_getAllowanceSlot(owner, spender), allowance_);
  }

  function _setBalance(address account, uint256 balance) internal {
    SlotAccess.setUint256(_getBalanceSlot(account), balance);
  }
}
