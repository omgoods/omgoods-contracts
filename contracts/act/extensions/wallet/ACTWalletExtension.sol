// SPDX-License-Identifier: None
pragma solidity 0.8.28;

import {Address} from "../../../common/Address.sol";
import {ACTExtension} from "../ACTExtension.sol";
import {IACTWallet} from "./interfaces/IACTWallet.sol";
import {IACTWalletEvents} from "./interfaces/IACTWalletEvents.sol";
import {ACTWalletTransaction} from "./structs.sol";

contract ACTWalletExtension is ACTExtension, IACTWallet {
  using Address for address;

  // external getters

  function getSupportedSelectors()
    external
    pure
    override
    returns (bytes4[] memory result)
  {
    result = new bytes4[](2);

    result[0] = IACTWallet.executeTransaction.selector;
    result[1] = IACTWallet.executeTransactions.selector;

    return result;
  }

  // external setters

  function executeTransaction(
    ACTWalletTransaction calldata transaction
  ) external onlyOwner {
    bytes memory result = _executeTransaction(transaction);

    emit TransactionExecuted(transaction, result);

    _triggerRegistryEvent(
      abi.encodeCall(
        IACTWalletEvents.TransactionExecuted,
        (transaction, result)
      )
    );
  }

  function executeTransactions(
    ACTWalletTransaction[] calldata transactions
  ) external onlyOwner returns (bool) {
    uint256 len = transactions.length;

    if (len == 0) {
      // nothing to do
      return false;
    }

    bytes[] memory results = new bytes[](len);

    for (uint256 index; index < len; ) {
      results[index] = _executeTransaction(transactions[index]);

      unchecked {
        ++index;
      }
    }

    emit TransactionsExecuted(transactions, results);

    _triggerRegistryEvent(
      abi.encodeCall(
        IACTWalletEvents.TransactionsExecuted,
        (transactions, results)
      )
    );

    return true;
  }

  // private setters

  function _executeTransaction(
    ACTWalletTransaction calldata transaction
  ) private returns (bytes memory) {
    require(transaction.to != address(0), ZeroAddressReceiver());

    return transaction.to.makeCall(transaction.value, transaction.data);
  }
}
