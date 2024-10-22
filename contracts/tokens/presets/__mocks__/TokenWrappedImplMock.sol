// SPDX-License-Identifier: None
pragma solidity 0.8.27;

import {TokenWrappedImpl} from "../TokenWrappedImpl.sol";

contract TokenWrappedImplMock is TokenWrappedImpl {
  // deployment

  constructor() TokenWrappedImpl() {
    //
  }
}
