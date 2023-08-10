// SPDX-License-Identifier: NONE
pragma solidity 0.8.20;

import {AccountExtension} from "../AccountExtension.sol";

abstract contract AccountExtensionMock is AccountExtension {
  // storage

  address private _owner;

  // events

  event TransactionExecuted(
    address sender,
    address to,
    uint256 value,
    bytes data
  );

  // deployment functions

  constructor() {
    _owner = msg.sender;
  }

  // internal functions (getters)

  function _hasOwner(address owner) internal view override returns (bool) {
    return owner == _owner;
  }

  // internal functions (setters)

  function _afterTransactionExecuted(
    address sender,
    address to,
    uint256 value,
    bytes memory data
  ) internal override {
    emit TransactionExecuted(sender, to, value, data);
  }
}
