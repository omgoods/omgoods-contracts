// SPDX-License-Identifier: NONE
pragma solidity 0.8.20;

import {ERC20Token} from "../ERC20Token.sol";

contract ERC20TokenMock is ERC20Token {
  // deployment functions

  constructor() ERC20Token(address(0)) {
    //
  }

  function initialize(
    address gateway,
    address tokenRegistry,
    string calldata name_,
    string calldata symbol_
  ) external {
    _initialize(gateway, tokenRegistry, name_, symbol_);
  }

  // external functions (setters)

  function mint(address to, uint256 amount) external {
    _mint(to, amount);
  }

  function burn(address from, uint256 amount) external {
    _burn(from, amount);
  }
}
