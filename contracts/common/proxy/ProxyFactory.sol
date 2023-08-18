// SPDX-License-Identifier: None
pragma solidity 0.8.21;

import {Proxy} from "./Proxy.sol";

abstract contract ProxyFactory {
  // internal setters

  function _createProxy(
    address proxyImpl,
    bytes32 salt
  ) internal returns (address result) {
    try new Proxy{salt: salt}(proxyImpl) returns (Proxy proxy) {
      result = address(proxy);
    } catch {
      result = address(0);
    }

    return result;
  }
}
