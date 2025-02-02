// SPDX-License-Identifier: None
pragma solidity 0.8.28;

import {ACTExtension} from "../ACTExtension.sol";

contract ACTWalletExtension is ACTExtension {
  // struct

  struct Transaction {
    address to;
    uint256 value;
    bytes data;
  }

  // external getters

  function getSupportedSelectors()
    external
    pure
    override
    returns (bytes4[] memory result)
  {
    result = new bytes4[](2);

    result[0] = ACTWalletExtension.executeTransaction.selector;
    result[1] = ACTWalletExtension.executeTransactions.selector;

    return result;
  }

  // external setters

  function executeTransaction(
    Transaction calldata transaction
  ) external onlyOwner returns (bytes memory) {
    return _executeTransaction(transaction);
  }

  function executeTransactions(
    Transaction[] calldata transactions
  ) external onlyOwner returns (bytes[] memory result) {
    uint256 len = transactions.length;

    if (len == 0) {
      return result;
    }

    result = new bytes[](len);

    for (uint256 index; index < len; ) {
      result[index] = _executeTransaction(transactions[index]);

      unchecked {
        index += 1;
      }
    }

    return result;
  }

  // private setters

  function _executeTransaction(
    Transaction calldata transaction
  ) private returns (bytes memory) {
    require(transaction.to != address(0), ZeroAddressReceiver());

    (bool success, bytes memory response) = transaction.to.call{
      value: transaction.value
    }(transaction.data);

    if (!success) {
      // solhint-disable-next-line no-inline-assembly
      assembly {
        revert(add(response, 32), mload(response))
      }
    }

    return response;
  }
}
