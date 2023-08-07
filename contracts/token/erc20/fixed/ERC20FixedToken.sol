// SPDX-License-Identifier: NONE
pragma solidity 0.8.20;

import {Ownable} from "../../../common/access/Ownable.sol";
import {ERC20Token} from "../ERC20Token.sol";

contract ERC20FixedToken is ERC20Token {
  // deployment functions

  constructor() Ownable(address(this)) {
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
    _initialize(owner, gateway, tokenRegistry, name_, symbol_);

    _mint(owner, totalSupply_);
  }
}
