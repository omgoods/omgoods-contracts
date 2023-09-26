// SPDX-License-Identifier: None
pragma solidity 0.8.21;

import {ERC20TokenFactory} from "../ERC20TokenFactory.sol";

contract ERC20TokenFactoryMock is ERC20TokenFactory {
  // deployment

  constructor(
    address owner,
    string memory name,
    string memory version
  ) ERC20TokenFactory(owner, name, version) {
    //
  }

  // external setters

  function addToken(address token) external {
    _tokens[token] = true;
  }
}
