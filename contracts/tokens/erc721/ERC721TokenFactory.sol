// SPDX-License-Identifier: None
pragma solidity 0.8.21;

import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {TokenFactory} from "../TokenFactory.sol";

abstract contract ERC721TokenFactory is TokenFactory {
  using Strings for address;
  using Strings for uint256;

  // storage

  string private _baseUrl;

  // events

  event Initialized(
    address gateway,
    address[] guardians,
    address tokenImpl,
    string baseUrl
  );

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

  function initialize(
    address gateway,
    address[] calldata guardians,
    address tokenImpl,
    string calldata baseUrl
  ) external {
    _initialize(gateway, guardians, tokenImpl);

    _baseUrl = string.concat(baseUrl, block.chainid.toString(), "/");

    emit Initialized(gateway, guardians, tokenImpl, baseUrl);
  }

  // external setters

  function computeTokenUrl(
    address token,
    uint256 tokenId
  ) external view returns (string memory) {
    return
      string.concat(_baseUrl, token.toHexString(), "/", tokenId.toString());
  }

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
