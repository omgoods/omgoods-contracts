// SPDX-License-Identifier: NONE
pragma solidity 0.8.20;

import {TokenRegistry} from "../TokenRegistry.sol";

contract TokenRegistryMock is TokenRegistry {
  // deployment functions

  constructor() TokenRegistry(address(0)) {
    //
  }
}
