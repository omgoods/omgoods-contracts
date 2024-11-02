// SPDX-License-Identifier: None
pragma solidity 0.8.27;

import {CloneImpl} from "../CloneImpl.sol";

contract CloneImplMock is CloneImpl {
  uint256 public a;

  // deployment

  constructor() CloneImpl() {
    //
  }

  function initialize(uint256 a_) external {
    a = a_;
  }

  // external setters

  function setA(uint256 a_) external {
    a = a_;
  }
}
