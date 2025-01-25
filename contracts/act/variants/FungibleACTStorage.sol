// SPDX-License-Identifier: None
pragma solidity 0.8.28;

import {SlotAccess} from "../../utils/SlotAccess.sol";

abstract contract FungibleACTStorage {
  // slots

  bytes32 private constant SLOT_ALLOWANCE =
    keccak256(abi.encodePacked("FungibleACT#allowance"));

  // internal getters

  function _getAllowance(
    address owner,
    address spender
  ) internal view returns (uint256) {
    return SlotAccess.getUint256(_getAllowanceSlot(owner, spender));
  }

  // internal setters

  function _setAllowance(
    address owner,
    address spender,
    uint256 allowance_
  ) internal {
    SlotAccess.setUint256(_getAllowanceSlot(owner, spender), allowance_);
  }

  // private getters

  function _getAllowanceSlot(
    address owner,
    address spender
  ) private pure returns (bytes32) {
    return keccak256(abi.encodePacked(SLOT_ALLOWANCE, owner, spender));
  }
}
