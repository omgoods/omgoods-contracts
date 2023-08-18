// SPDX-License-Identifier: None
pragma solidity 0.8.21;

// solhint-disable no-unused-import

import {PROXY_IMPL_SLOT} from "./constants.sol";

// solhint-enable no-unused-import

abstract contract ProxyImpl {
  // events

  event ProxyImplUpdated(address proxyImpl);

  // errors

  error ProxyImplIsTheZeroAddress();

  // external getters

  function getProxyImpl() external view returns (address proxyImpl) {
    // solhint-disable-next-line no-inline-assembly
    assembly {
      proxyImpl := sload(PROXY_IMPL_SLOT)
    }

    return proxyImpl;
  }

  // internal setters

  function _setProxyImpl(address proxyImpl) internal {
    if (proxyImpl == address(0)) {
      revert ProxyImplIsTheZeroAddress();
    }

    // solhint-disable-next-line no-inline-assembly
    assembly {
      sstore(PROXY_IMPL_SLOT, proxyImpl)
    }

    emit ProxyImplUpdated(proxyImpl);
  }
}
