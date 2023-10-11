// SPDX-License-Identifier: None
pragma solidity 0.8.21;

import {ERC721TokenFactory} from "../ERC721TokenFactory.sol";

contract ERC721TokenFactoryMock is ERC721TokenFactory {
  // deployment

  constructor() ERC721TokenFactory(address(0), "") {
    //
  }

  // external setters

  function addToken(address token) external {
    _tokens[token] = true;
  }
}
