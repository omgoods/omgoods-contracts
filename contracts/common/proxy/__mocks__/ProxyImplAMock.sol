// SPDX-License-Identifier: NONE
pragma solidity 0.8.20;

import {ProxyImpl} from "../ProxyImpl.sol";

contract ProxyImplAMock is ProxyImpl {
  // storage

  uint256 private _a;

  uint256 private _b;

  // events

  event AUpdated(uint256 a);

  // external functions (setters)

  function setA(uint256 a) external {
    _a = a;

    emit AUpdated(a);
  }

  function setImpl(address impl) external {
    _setImpl(impl);
  }
}
