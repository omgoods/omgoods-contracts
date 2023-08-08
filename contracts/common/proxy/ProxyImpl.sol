// SPDX-License-Identifier: NONE
pragma solidity 0.8.20;

// solhint-disable no-unused-import

import {PROXY_IMPL_SLOT} from "./constants.sol";

// solhint-enable no-unused-import

abstract contract ProxyImpl {
  // events

  event ImplUpdated(address impl);

  // errors

  error ImplIsTheZeroAddress();

  // external functions (getters)

  function getImpl() external view returns (address impl) {
    // solhint-disable-next-line no-inline-assembly
    assembly {
      impl := sload(PROXY_IMPL_SLOT)
    }

    return impl;
  }

  // internal functions (setters)

  function _setImpl(address impl) internal {
    if (impl == address(0)) {
      revert ImplIsTheZeroAddress();
    }

    // solhint-disable-next-line no-inline-assembly
    assembly {
      sstore(PROXY_IMPL_SLOT, impl)
    }

    emit ImplUpdated(impl);
  }
}
