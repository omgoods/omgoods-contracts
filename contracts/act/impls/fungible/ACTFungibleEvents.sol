// SPDX-License-Identifier: None
pragma solidity 0.8.28;

/* solhint-disable func-name-mixedcase */

interface ACTFungibleEvents {
  // external getters

  function FungibleApproval(
    address owner,
    address spender,
    uint256 value
  ) external view;

  function FungibleTransfer(
    uint48 epoch,
    address from,
    address to,
    uint256 value
  ) external view;
}
