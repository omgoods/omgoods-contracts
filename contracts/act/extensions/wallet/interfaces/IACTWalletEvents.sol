// SPDX-License-Identifier: None
pragma solidity 0.8.28;

import {ACTWalletTransaction} from "../structs.sol";

/* solhint-disable func-name-mixedcase */

interface IACTWalletEvents {
  // pseudo events

  function TransactionExecuted(
    ACTWalletTransaction calldata transaction,
    bytes calldata result
  ) external view;

  function TransactionsExecuted(
    ACTWalletTransaction[] calldata transactions,
    bytes[] calldata results
  ) external view;
}
