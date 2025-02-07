// SPDX-License-Identifier: None
pragma solidity 0.8.28;

/* solhint-disable func-name-mixedcase */

interface IACTFungibleEvents {
  // pseudo events

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
