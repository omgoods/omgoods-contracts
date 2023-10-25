// SPDX-License-Identifier: None
pragma solidity 0.8.21;

import {ERC20Token} from "../ERC20Token.sol";

contract ERC20TokenMock is ERC20Token {
  // deployment

  constructor() ERC20Token() {
    //
  }

  // external setters

  function mint(address to, uint256 value) external {
    _mint(to, value);
  }

  function burn(address from, uint256 value) external {
    _burn(from, value);
  }
}
