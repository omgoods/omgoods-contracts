// SPDX-License-Identifier: None
pragma solidity 0.8.21;

import {Token} from "../Token.sol";

contract TokenMock is Token {
  // external setters

  function notifyTokenRegistry(uint8 kind) internal {
    _notifyTokenRegistry(kind);
  }

  function notifyTokenRegistry(uint8 kind, bytes memory encodedData) internal {
    _notifyTokenRegistry(kind, encodedData);
  }
}
