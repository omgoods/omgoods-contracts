// SPDX-License-Identifier: NONE
pragma solidity 0.8.21;

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

  // deployment

  constructor() {
    _owner = msg.sender;
  }

  // internal getters

  function _hasOwner(address owner) internal view override returns (bool) {
    return owner == _owner;
  }

  // internal setters

  function _afterTransactionExecuted(
    address sender,
    address to,
    uint256 value,
    bytes memory data
  ) internal override {
    emit TransactionExecuted(sender, to, value, data);
  }
}
