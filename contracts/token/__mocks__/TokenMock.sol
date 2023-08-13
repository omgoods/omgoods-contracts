// SPDX-License-Identifier: NONE
pragma solidity 0.8.21;

import {Token} from "../Token.sol";

contract TokenMock is Token {
  // events

  event Initialized(address gateway, address tokenRegistry);

  // deployment

  constructor() Token(address(0)) {
    //
  }

  function initialize(address gateway, address tokenRegistry) external {
    _initialize(gateway, tokenRegistry);

    emit Initialized(gateway, tokenRegistry);
  }
}
