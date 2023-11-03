// SPDX-License-Identifier: None
pragma solidity 0.8.21;

import {TokenImpl} from "../TokenImpl.sol";

contract TokenImplMock is TokenImpl {
  // deployment

  constructor() TokenImpl() {
    //
  }

  function initialize(address gateway, bool locked) external {
    _initialize(gateway, locked);
  }
}
