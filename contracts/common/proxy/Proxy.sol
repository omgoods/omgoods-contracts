// SPDX-License-Identifier: NONE
pragma solidity 0.8.20;

// solhint-disable no-unused-import

import {PROXY_IMPL_SLOT} from "./constants.sol";

// solhint-enable no-unused-import

contract Proxy {
  // deployment functions

  constructor(address proxyImpl) {
    // solhint-disable-next-line no-inline-assembly
    assembly {
      sstore(PROXY_IMPL_SLOT, proxyImpl)
    }
  }

  // wildcard functions

  fallback() external payable {
    // solhint-disable-next-line no-inline-assembly
    assembly {
      let proxyImpl := sload(PROXY_IMPL_SLOT)

      calldatacopy(0, 0, calldatasize())

      let success := delegatecall(gas(), proxyImpl, 0, calldatasize(), 0, 0)

      returndatacopy(0, 0, returndatasize())

      if eq(success, 0) {
        revert(0, returndatasize())
      }

      return(0, returndatasize())
    }
  }
}
