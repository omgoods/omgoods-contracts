// SPDX-License-Identifier: None
pragma solidity 0.8.24;

import {DefaultTokenImpl} from "../DefaultTokenImpl.sol";

contract DefaultTokenImplMock is DefaultTokenImpl {
  // deployment

  constructor() DefaultTokenImpl() {
    //
  }

  // external getters

  function triggerOnlyController() external view onlyController returns (bool) {
    return true;
  }
}
