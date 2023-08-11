// SPDX-License-Identifier: NONE
pragma solidity 0.8.20;

import {ERC20Token} from "../ERC20Token.sol";

contract ERC20FixedTokenImpl is ERC20Token {
  // deployment

  constructor() ERC20Token(address(0)) {
    _initialized = true; // singleton
  }

  function initialize(
    address owner,
    address gateway,
    address tokenRegistry,
    string calldata name_,
    string calldata symbol_,
    uint256 totalSupply_
  ) external {
    _owner = owner;

    _initialize(gateway, tokenRegistry, name_, symbol_);

    _mint(owner, totalSupply_);
  }
}
