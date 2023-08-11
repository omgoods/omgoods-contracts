// SPDX-License-Identifier: NONE
pragma solidity 0.8.20;

import {IAccountRegistry} from "../IAccountRegistry.sol";

contract AccountRegistryMock is IAccountRegistry {
  // storage

  mapping(address => mapping(address => bool)) private _accountOwners;

  // external getters

  function isAccountOwner(
    address account,
    address owner
  ) external view returns (bool) {
    return _accountOwners[account][owner];
  }

  // external setters

  function addAccountOwner(address account, address owner) external {
    _accountOwners[account][owner] = true;
  }

  function directAddAccountOwner(address owner) external {
    _accountOwners[msg.sender][owner] = true;

    emit AccountOwnerAdded(msg.sender, owner);
  }

  function directRemoveAccountOwner(address owner) external {
    _accountOwners[msg.sender][owner] = false;

    emit AccountOwnerRemoved(msg.sender, owner);
  }

  function emitAccountTransactionExecuted(
    address to,
    uint256 value,
    bytes calldata data
  ) external {
    emit AccountTransactionExecuted(msg.sender, to, value, data);
  }

  function emitAccountTransactionsExecuted(
    address[] calldata to,
    uint256[] calldata value,
    bytes[] calldata data
  ) external {
    emit AccountTransactionsExecuted(msg.sender, to, value, data);
  }
}
