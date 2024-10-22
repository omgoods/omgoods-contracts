// SPDX-License-Identifier: None
pragma solidity 0.8.27;

import {TokenImpl} from "../TokenImpl.sol";

contract TokenImplMock is TokenImpl {
  // deployment

  constructor() TokenImpl() {
    //
  }

  function initialize(address forwarder, bool locked) external {
    _initialize(forwarder, locked);
  }
}
