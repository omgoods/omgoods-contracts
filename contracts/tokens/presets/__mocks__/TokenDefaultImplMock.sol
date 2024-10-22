// SPDX-License-Identifier: None
pragma solidity 0.8.27;

import {TokenDefaultImpl} from "../TokenDefaultImpl.sol";

contract TokenDefaultImplMock is TokenDefaultImpl {
  // deployment

  constructor() TokenDefaultImpl() {
    //
  }

  // external getters

  function triggerOnlyController() external view onlyController returns (bool) {
    return true;
  }
}
