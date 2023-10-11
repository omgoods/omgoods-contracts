// SPDX-License-Identifier: None
pragma solidity 0.8.21;

import {TokenFactory} from "../TokenFactory.sol";

abstract contract ERC721TokenFactory is TokenFactory {
  // events

  event TokenTransfer(address token, address from, address to, uint256 tokenId);

  event TokenApproval(
    address token,
    address owner,
    address approved,
    uint256 tokenId
  );

  event TokenApprovalForAll(
    address token,
    address owner,
    address operator,
    bool approved
  );

  // deployment

  constructor(address owner, string memory name) TokenFactory(owner, name) {
    //
  }

  // external setters

  function emitTokenTransfer(
    address from,
    address to,
    uint256 tokenId
  ) external onlyToken {
    emit TokenTransfer(msg.sender, from, to, tokenId);
  }

  function emitTokenApproval(
    address owner,
    address approved,
    uint256 tokenId
  ) external onlyToken {
    emit TokenApproval(msg.sender, owner, approved, tokenId);
  }

  function emitTokenApprovalForAll(
    address owner,
    address operator,
    bool approved
  ) external onlyToken {
    emit TokenApprovalForAll(msg.sender, owner, operator, approved);
  }
}
