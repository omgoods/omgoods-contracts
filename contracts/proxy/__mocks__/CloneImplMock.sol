// SPDX-License-Identifier: None
pragma solidity 0.8.27;

import {CloneImpl} from "../CloneImpl.sol";

contract CloneImplMock is CloneImpl {
  // storage

  uint256 public value;

  // deployment

  constructor(address factory) CloneImpl() {
    _setFactory(factory);
  }

  function initialize(uint256 value_) external onlyFactory {
    value = value_;
  }

  // fallbacks

  receive() external payable {
    //
  }

  // external setters

  function setValue(uint256 value_) external {
    value = value_;
  }
}
