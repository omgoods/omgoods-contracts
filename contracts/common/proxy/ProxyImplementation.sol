// SPDX-License-Identifier: NONE
pragma solidity 0.8.20;

// solhint-disable no-unused-import

import {PROXY_IMPLEMENTATION_SLOT} from "./constants.sol";

// solhint-enable no-unused-import

abstract contract ProxyImplementation {
  // events

  event ImplementationUpdated(address implementation);

  // errors

  error ImplementationIsTheZeroAddress();

  // internal functions (setters)

  function _setImplementation(address implementation) internal {
    if (implementation == address(0)) {
      revert ImplementationIsTheZeroAddress();
    }

    // solhint-disable-next-line no-inline-assembly
    assembly {
      sstore(PROXY_IMPLEMENTATION_SLOT, implementation)
    }

    emit ImplementationUpdated(implementation);
  }
}
