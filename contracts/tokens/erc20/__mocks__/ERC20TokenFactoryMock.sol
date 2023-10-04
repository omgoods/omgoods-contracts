// SPDX-License-Identifier: None
pragma solidity 0.8.21;

import {ERC20TokenFactory} from "../ERC20TokenFactory.sol";

contract ERC20TokenFactoryMock is ERC20TokenFactory {
  // deployment

  constructor() ERC20TokenFactory(address(0), "") {
    //
  }

  // external setters

  function addToken(address token) external {
    _tokens[token] = true;
  }
}
