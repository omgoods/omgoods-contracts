// SPDX-License-Identifier: NONE
pragma solidity 0.8.20;

import {IAccount} from "@account-abstraction/contracts/interfaces/IAccount.sol";
import {UserOperation} from "@account-abstraction/contracts/interfaces/UserOperation.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {AccountExtension} from "./AccountExtension.sol";

abstract contract ERC4337Account is IAccount, AccountExtension {
  using ECDSA for bytes32;

  // storage

  address internal _entryPoint;

  // errors

  error MsgSenderIsNotTheEntryPoint();

  // external setters

  function validateUserOp(
    UserOperation calldata userOp,
    bytes32 userOpHash,
    uint256 missingAccountFunds
  ) external returns (uint256 result) {
    if (msg.sender != _entryPoint) {
      revert MsgSenderIsNotTheEntryPoint();
    }

    bytes32 hash = userOpHash.toEthSignedMessageHash();

    if (!_hasOwner(hash.recover(userOp.signature))) {
      result = 1;
    }

    if (missingAccountFunds != 0) {
      bytes memory data = new bytes(0);

      (bool success, ) = _entryPoint.call{
        value: missingAccountFunds,
        gas: type(uint256).max
      }(data);

      (success); // always success

      _afterTransactionExecuted(
        _entryPoint,
        _entryPoint,
        missingAccountFunds,
        data
      );
    }

    return result;
  }
}
