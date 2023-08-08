// SPDX-License-Identifier: NONE
pragma solidity 0.8.20;

import {ProxyFactory} from "../ProxyFactory.sol";

contract ProxyFactoryMock is ProxyFactory {
  // events

  event ProxyCreated(address proxy);

  // errors

  error ProxyAlreadyCreated();

  // external functions (setters)

  function createProxy(address impl, bytes32 salt) external {
    address proxy = _createProxy(impl, salt);

    if (proxy == address(0)) {
      revert ProxyAlreadyCreated();
    }

    emit ProxyCreated(proxy);
  }
}
