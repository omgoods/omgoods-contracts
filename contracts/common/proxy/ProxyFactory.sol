// SPDX-License-Identifier: NONE
pragma solidity 0.8.20;

import {Proxy} from "./Proxy.sol";

abstract contract ProxyFactory {
  // internal functions (setters)

  function _createProxy(
    address proxyImpl,
    bytes32 salt
  ) internal returns (address result) {
    try new Proxy{salt: salt}(proxyImpl) returns (Proxy proxy) {
      result = address(proxy);
    } catch {
      // solhint-disable-next-line no-empty-blocks
      {

      }
    }

    return result;
  }
}
