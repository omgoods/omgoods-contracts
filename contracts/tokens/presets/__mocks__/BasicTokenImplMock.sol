// SPDX-License-Identifier: None
pragma solidity 0.8.21;

import {BasicTokenImpl} from "../BasicTokenImpl.sol";

contract BasicTokenImplMock is BasicTokenImpl {
  // deployment

  constructor() BasicTokenImpl() {
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
