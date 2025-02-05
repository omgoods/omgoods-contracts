// SPDX-License-Identifier: None
pragma solidity 0.8.28;

import {IACT} from "./IACT.sol";

interface IACTNonFungible is IACT {
  // events

  event Approval(
    address indexed owner,
    address indexed approved,
    uint256 indexed tokenId
  );

  event ApprovalForAll(
    address indexed owner,
    address indexed operator,
    bool approved
  );

  event Transfer(
    address indexed from,
    address indexed to,
    uint256 indexed tokenId
  );

  // external getters

  function tokenURI(uint256 tokenId) external view returns (string memory);

  function ownerOf(uint256 tokenId) external view returns (address owner);

  function getApproved(
    uint256 tokenId
  ) external view returns (address operator);

  function isApprovedForAll(
    address owner,
    address operator
  ) external view returns (bool);

  // external setters

  function approve(address to, uint256 tokenId) external;

  function setApprovalForAll(address operator, bool approved) external;

  function transferFrom(address from, address to, uint256 tokenId) external;

  function safeTransferFrom(
    address from,
    address to,
    uint256 tokenId,
    bytes calldata data
  ) external;

  function safeTransferFrom(address from, address to, uint256 tokenId) external;
}
