// SPDX-License-Identifier: None
pragma solidity 0.8.21;

import {Token} from "../Token.sol";

contract TokenMock is Token {
  // deployment

  constructor() {
    _setInitialOwner(address(0));
  }

  function initialize(address gateway, address tokenRegistry) external {
    _initialize(gateway, tokenRegistry);
  }

  // external setters

  function notifyTokenRegistry(uint8 kind, bytes memory encodedData) external {
    _notifyTokenRegistry(kind, encodedData);
  }
}
