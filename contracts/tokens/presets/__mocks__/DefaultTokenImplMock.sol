// SPDX-License-Identifier: None
pragma solidity 0.8.21;

import {DefaultTokenImpl} from "../DefaultTokenImpl.sol";

contract DefaultTokenImplMock is DefaultTokenImpl {
  // deployment

  constructor() DefaultTokenImpl() {
    //
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

  function triggerOnlyController() external view onlyController returns (bool) {
    return true;
  }
}