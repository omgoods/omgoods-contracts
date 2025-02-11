// SPDX-License-Identifier: None
pragma solidity 0.8.28;

/* solhint-disable func-name-mixedcase */

interface IACTNonFungiblePseudoEvents {
  // pseudo events

  function NonFungibleApproval(
    address owner,
    address approved,
    uint256 tokenId
  ) external view;

  function NonFungibleApprovalForAll(
    address owner,
    address operator,
    bool approved
  ) external view;

  function NonFungibleTransfer(
    address from,
    address to,
    uint256 tokenId
  ) external view;
}
