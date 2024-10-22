// SPDX-License-Identifier: None
pragma solidity 0.8.27;

import {Token} from "./Token.sol";

abstract contract TokenImpl is Token {
  // deployment

  constructor() {
    _initialized = true;
  }

  function _initialize(address forwarder, bool locked) internal {
    _initialize(forwarder, msg.sender, locked);
  }
}
