// SPDX-License-Identifier: None
pragma solidity 0.8.28;

import {IACTWalletTypes} from "./IACTWalletTypes.sol";

/* solhint-disable func-name-mixedcase */

interface IACTWalletPseudoEvents is IACTWalletTypes {
  // pseudo events

  function TransactionExecuted(
    Transaction calldata transaction,
    bytes calldata result
  ) external view;

  function TransactionsExecuted(
    Transaction[] calldata transactions,
    bytes[] calldata results
  ) external view;
}
