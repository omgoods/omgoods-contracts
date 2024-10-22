// SPDX-License-Identifier: None
pragma solidity 0.8.27;

import {ERC20Token} from "../ERC20Token.sol";

contract ERC20TokenMock is ERC20Token {
  // deployment

  function initialize(
    address tokenRegistry,
    bool locked,
    uint256 totalSupply_
  ) external {
    _initialize(address(0), tokenRegistry, locked);

    _mint(msg.sender, totalSupply_);
  }
}
