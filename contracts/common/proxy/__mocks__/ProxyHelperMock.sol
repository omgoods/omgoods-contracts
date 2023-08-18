// SPDX-License-Identifier: None
pragma solidity 0.8.21;

import {ProxyHelper} from "../ProxyHelper.sol";

contract ProxyHelperMock {
  // external getters

  function computeProxy(
    address deployer,
    address proxyImpl,
    bytes32 salt
  ) external pure returns (address) {
    return ProxyHelper.computeProxy(deployer, proxyImpl, salt);
  }
}
