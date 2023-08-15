// SPDX-License-Identifier: NONE
pragma solidity 0.8.21;

import {ProxyImpl} from "../common/proxy/ProxyImpl.sol";
import {Account} from "./Account.sol";

contract AccountImpl is ProxyImpl, Account {
  // deployment

  constructor() {
    _initialized = true; // singleton
  }

  function initialize(address gateway, address entryPoint) external {
    _initialize(gateway, entryPoint, msg.sender);
  }
}
