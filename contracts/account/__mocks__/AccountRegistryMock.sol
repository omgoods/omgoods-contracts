// SPDX-License-Identifier: NONE
pragma solidity 0.8.20;

import "../IAccountRegistry.sol";

contract AccountRegistryMock is IAccountRegistry {
  // storage

  mapping(address => mapping(address => bool)) private _accountOwners;

  // external functions (getters)

  function isAccountOwner(
    address account,
    address owner
  ) external view returns (bool) {
    return _accountOwners[account][owner];
  }

  // external functions (setters)

  function addAccountOwner(address account, address owner) external {
    _accountOwners[account][owner] = true;

    emit AccountOwnerAdded(account, owner);
  }

  function removeAccountOwner(address account, address owner) external {
    _accountOwners[account][owner] = false;

    emit AccountOwnerRemoved(account, owner);
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
