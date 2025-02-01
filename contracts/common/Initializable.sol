// SPDX-License-Identifier: None
pragma solidity 0.8.28;

import {IInitializable} from "./interfaces/IInitializable.sol";

abstract contract Initializable is IInitializable {
  // storage

  address private _initializer;

  // errors

  error MsgSenderIsNotTheInitializer();

  // modifiers

  modifier initializeOnce() {
    require(_initializer != address(0), AlreadyInitialized());

    require(msg.sender == _initializer, MsgSenderIsNotTheInitializer());

    _;

    delete _initializer;
  }

  // deployment

  constructor(address initializer) {
    _initializer = initializer == address(0) ? msg.sender : initializer;
  }

  // external getters

  function isInitialized() external view returns (bool) {
    return _initializer == address(0);
  }
}
