// SPDX-License-Identifier: None
pragma solidity 0.8.28;

import {ITokenMetadata} from "./ITokenMetadata.sol";

interface IERC721 is ITokenMetadata {
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

  function ownerOf(uint256 tokenId) external view returns (address owner);

  function getApproved(
    uint256 tokenId
  ) external view returns (address operator);

  function isApprovedForAll(
    address owner,
    address operator
  ) external view returns (bool);

  function balanceOf(address owner) external view returns (uint256 balance);

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
