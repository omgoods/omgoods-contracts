// SPDX-License-Identifier: None
pragma solidity 0.8.21;

import {ERC20Token} from "../ERC20Token.sol";

contract ERC20TokenMock is ERC20Token {
  // deployment

  function initialize(address tokenRegistry, uint256 totalSupply_) external {
    _initialize(address(0), tokenRegistry);

    _mint(msg.sender, totalSupply_);
  }
}
