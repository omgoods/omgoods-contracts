// SPDX-License-Identifier: NONE
pragma solidity 0.8.20;

import {ProxyFactory} from "../ProxyFactory.sol";

contract ProxyFactoryMock is ProxyFactory {
  // events

  event ProxyCreated(address proxy);

  // external functions (setters)

  function createProxy(
    address proxyImpl,
    bytes32 salt
  ) external returns (address) {
    return _createProxy(proxyImpl, salt);
  }
}
