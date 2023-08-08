// SPDX-License-Identifier: NONE
pragma solidity 0.8.20;

import {ProxyHelper} from "../ProxyHelper.sol";

contract ProxyHelperMock {
  // external functions (getters)

  function computeProxy(
    address deployer,
    address impl,
    bytes32 salt
  ) external pure returns (address) {
    return ProxyHelper.computeProxy(deployer, impl, salt);
  }
}
