// SPDX-License-Identifier: None
pragma solidity 0.8.21;

import {ProxyFactory} from "../ProxyFactory.sol";

contract ProxyFactoryMock is ProxyFactory {
  // events

  event ProxyCreated(address proxy);

  // external setters

  function createProxy(
    address proxyImpl,
    bytes32 salt
  ) external returns (address) {
    return _createProxy(proxyImpl, salt);
  }
}
