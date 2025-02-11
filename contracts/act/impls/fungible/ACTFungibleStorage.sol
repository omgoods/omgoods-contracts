// SPDX-License-Identifier: None
pragma solidity 0.8.28;

import {StorageSlot} from "@openzeppelin/contracts/utils/StorageSlot.sol";

contract ACTFungibleStorage {
  // slots

  bytes32 private constant ALLOWANCE_SLOT =
    keccak256(abi.encodePacked("act.fungible#allowance"));

  // internal getters

  function _getAllowanceSlot(
    address owner,
    address spender
  ) internal pure returns (StorageSlot.Uint256Slot storage) {
    return
      StorageSlot.getUint256Slot(
        keccak256(abi.encodePacked(ALLOWANCE_SLOT, owner, spender)) //
      );
  }
}
