// SPDX-License-Identifier: None
pragma solidity 0.8.21;

import {Token} from "./Token.sol";

abstract contract TokenImpl is Token {
  // deployment

  constructor() {
    _initialized = true;
  }

  function _initialize(address gateway) internal initializeOnce {
    _gateway = gateway;
    _tokenRegistry = msg.sender;
  }
}
