// SPDX-License-Identifier: NONE
pragma solidity 0.8.20;

import {Token} from "../Token.sol";

contract TokenMock is Token {
  // deployment functions

  constructor() Token(address(0)) {
    //
  }

  function initialize(address gateway, address tokenRegistry) external {
    _initialize(gateway, tokenRegistry);
  }
}
