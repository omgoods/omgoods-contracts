// SPDX-License-Identifier: None
pragma solidity 0.8.21;

import {ERC721Token} from "../ERC721Token.sol";

contract ERC721TokenMock is ERC721Token {
  // deployment

  constructor() ERC721Token() {
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
