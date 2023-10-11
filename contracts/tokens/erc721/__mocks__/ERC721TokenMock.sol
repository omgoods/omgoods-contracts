// SPDX-License-Identifier: None
pragma solidity 0.8.21;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract ERC721TokenMock is ERC721 {
  // deployment

  constructor(
    string memory name_,
    string memory symbol_
  ) ERC721(name_, symbol_) {
    //
  }

  // external setters

  function mint(address to, uint256 tokenId) external {
    _mint(to, tokenId);
  }

  function burn(uint256 tokenId) external {
    _burn(tokenId);
  }
}
