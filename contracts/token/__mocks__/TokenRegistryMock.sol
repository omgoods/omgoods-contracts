// SPDX-License-Identifier: NONE
pragma solidity 0.8.21;

import {TokenRegistry} from "../TokenRegistry.sol";

contract TokenRegistryMock is TokenRegistry {
  // deployment

  constructor() TokenRegistry(address(0)) {
    //
  }
}
