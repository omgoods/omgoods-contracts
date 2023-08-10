// SPDX-License-Identifier: NONE
pragma solidity 0.8.20;

interface IAccountRegistry {
  // events

  event AccountOwnerAdded(address account, address owner);

  event AccountOwnerRemoved(address account, address owner);

  event AccountTransactionExecuted(
    address account,
    address to,
    uint256 value,
    bytes data
  );

  event AccountTransactionsExecuted(
    address account,
    address[] to,
    uint256[] value,
    bytes[] data
  );

  // external functions (getters)

  function isAccountOwner(
    address account,
    address owner
  ) external view returns (bool);

  // external functions (setters)

  function addAccountOwner(address account, address owner) external;

  function removeAccountOwner(address account, address owner) external;

  function emitAccountTransactionExecuted(
    address to,
    uint256 value,
    bytes calldata data
  ) external;

  function emitAccountTransactionsExecuted(
    address[] calldata to,
    uint256[] calldata value,
    bytes[] calldata data
  ) external;
}
