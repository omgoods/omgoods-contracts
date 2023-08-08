// SPDX-License-Identifier: NONE
pragma solidity 0.8.20;

contract ProxyImplBMock {
  // storage

  uint256 private _a;

  uint256 private _b;

  // events

  event BUpdated(uint256 b);

  // external functions (setters)

  function setB(uint256 b) external {
    _b = b;

    emit BUpdated(b);
  }
}
