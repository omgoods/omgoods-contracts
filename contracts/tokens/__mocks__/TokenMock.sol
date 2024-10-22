// SPDX-License-Identifier: None
pragma solidity 0.8.27;

import {Token} from "../Token.sol";

contract TokenMock is Token {
  // deployment

  constructor() {
    _setInitialOwner(address(0));
  }

  function initialize(
    address forwarder,
    address tokenRegistry,
    bool locked
  ) external {
    _initialize(forwarder, tokenRegistry, locked);
  }

  // external getters

  function triggerOnlyOwnerWhenLocked()
    external
    view
    onlyOwnerWhenLocked
    returns (bool)
  {
    return true;
  }

  // external setters

  function notifyTokenRegistry(uint8 kind, bytes memory encodedData) external {
    _notifyTokenRegistry(kind, encodedData);
  }
}
