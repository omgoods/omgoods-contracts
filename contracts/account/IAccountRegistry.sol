// SPDX-License-Identifier: None
pragma solidity 0.8.21;

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

  // external getters

  function isAccountOwner(
    address account,
    address owner
  ) external view returns (bool);

  // external setters

  function directAddAccountOwner(address owner) external;

  function directRemoveAccountOwner(address owner) external;

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
