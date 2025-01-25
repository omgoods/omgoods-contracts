// SPDX-License-Identifier: None
pragma solidity 0.8.28;

interface FungibleACTEvents {
  // external getters

  function FungibleApproval(
    address owner,
    address spender,
    uint256 value
  ) external view;

  function FungibleTransfer(
    address from,
    address to,
    uint256 value
  ) external view;
}
