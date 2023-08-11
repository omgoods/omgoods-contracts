// SPDX-License-Identifier: NONE
pragma solidity 0.8.20;

import {ProxyImpl} from "../ProxyImpl.sol";

contract ProxyImplMock is ProxyImpl {
  // storage

  uint256 private _amount;

  // events

  event AmountUpdated(uint256 amount, uint256 value);

  // external setters

  function setAmount(uint256 amount) external payable {
    _amount = amount;

    emit AmountUpdated(amount, msg.value);
  }

  function setProxyImpl(address proxyImpl) external {
    _setProxyImpl(proxyImpl);
  }
}
