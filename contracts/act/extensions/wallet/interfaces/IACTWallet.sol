// SPDX-License-Identifier: None
pragma solidity 0.8.28;

import {ACTWalletTransaction} from "../structs.sol";

interface IACTWallet {
  // events

  event TransactionExecuted(ACTWalletTransaction transaction, bytes result);

  event TransactionsExecuted(
    ACTWalletTransaction[] transactions,
    bytes[] results
  );

  // external setters

  function executeTransaction(
    ACTWalletTransaction calldata transaction
  ) external;

  function executeTransactions(
    ACTWalletTransaction[] calldata transactions
  ) external returns (bool);
}
