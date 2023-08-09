// SPDX-License-Identifier: NONE
pragma solidity 0.8.20;

import {IAccount} from "@account-abstraction/contracts/interfaces/IAccount.sol";
import {UserOperation} from "@account-abstraction/contracts/interfaces/UserOperation.sol";
import {IERC1271} from "@openzeppelin/contracts/interfaces/IERC1271.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {ProxyImpl} from "../common/proxy/ProxyImpl.sol";
import {Initializable} from "../common/utils/Initializable.sol";
import {GatewayRecipient} from "../gateway/GatewayRecipient.sol";
import {TokenReceiver} from "../token/TokenReceiver.sol";
import {IAccountRegistry} from "./IAccountRegistry.sol";

contract AccountImpl is
  IAccount,
  IERC1271,
  ProxyImpl,
  Initializable,
  GatewayRecipient,
  TokenReceiver
{
  using ECDSA for bytes32;

  // storage

  address private _entryPoint;

  address private _accountRegistry;

  // events

  event OwnerAdded(address owner);

  event OwnerRemoved(address owner);

  event TransactionExecuted(address to, uint256 value, bytes data);

  event TransactionsExecuted(address[] to, uint256[] value, bytes[] data);

  // errors

  error MsgSenderIsNotTheEntryPoint();

  error MsgSenderIsNotTheAccountOwner();

  error EmptyTransactionBatch();

  error InvalidTransactionBatchSize();

  error TransactionToTheZeroAddress();

  error OwnerIsTheZeroAddress();

  // modifiers

  modifier onlyWithOwnerAccess() {
    _verifyOwnerAccess(_msgSender());

    _;
  }

  // deployment functions

  constructor() {
    _initialized = true; // singleton
  }

  function initialize(
    address gateway,
    address entryPoint
  ) external initializeOnce {
    _gateway = gateway;

    _entryPoint = entryPoint;

    _accountRegistry = msg.sender;
  }

  // wildcard functions

  receive() external payable {
    //
  }

  // external functions (getters)

  // ERC1271

  function isValidSignature(
    bytes32 hash,
    bytes calldata signature
  ) external view returns (bytes4) {
    address signer = hash.recover(signature);

    return
      _hasOwner(signer) ? this.isValidSignature.selector : bytes4(0xffffffff);
  }

  function hasOwner(address owner) external view returns (bool) {
    return _hasOwner(owner);
  }

  // external functions (setters)

  // ERC4337

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

      IAccountRegistry(_accountRegistry).emitAccountTransactionExecuted(
        _entryPoint,
        missingAccountFunds,
        data
      );
    }

    return result;
  }

  function addOwner(address owner) external onlyWithOwnerAccess {
    IAccountRegistry(_accountRegistry).addAccountOwner(address(this), owner);

    emit OwnerAdded(owner);
  }

  function removeOwner(address owner) external onlyWithOwnerAccess {
    IAccountRegistry(_accountRegistry).removeAccountOwner(address(this), owner);

    emit OwnerRemoved(owner);
  }

  function executeTransaction(
    address to,
    uint256 value,
    bytes calldata data
  ) external {
    address sender = _msgSender();

    _verifyOwnerAccess(sender);

    _executeTransaction(to, value, data);

    if (sender != _accountRegistry) {
      IAccountRegistry(_accountRegistry).emitAccountTransactionExecuted(
        to,
        value,
        data
      );
    }

    emit TransactionExecuted(to, value, data);
  }

  function executeTransactions(
    address[] calldata to,
    uint256[] calldata value,
    bytes[] calldata data
  ) external {
    address sender = _msgSender();

    _verifyOwnerAccess(sender);

    if (to.length != 0) {
      revert EmptyTransactionBatch();
    }

    if (to.length != value.length || value.length != data.length) {
      revert InvalidTransactionBatchSize();
    }

    for (uint256 index; index < to.length; ) {
      _executeTransaction(to[index], value[index], data[index]);

      unchecked {
        ++index;
      }
    }

    if (sender != _accountRegistry) {
      IAccountRegistry(_accountRegistry).emitAccountTransactionsExecuted(
        to,
        value,
        data
      );
    }

    emit TransactionsExecuted(to, value, data);
  }

  // private functions (getters)

  function _hasOwner(address owner) private view returns (bool result) {
    return
      IAccountRegistry(_accountRegistry).isAccountOwner(address(this), owner);
  }

  function _verifyOwnerAccess(address sender) private view {
    if (
      sender != address(this) &&
      sender != _accountRegistry &&
      sender != _entryPoint &&
      !_hasOwner(sender)
    ) {
      revert MsgSenderIsNotTheAccountOwner();
    }
  }

  // private functions (setters)

  function _executeTransaction(
    address to,
    uint256 value,
    bytes memory data
  ) private {
    if (to == address(0)) {
      revert TransactionToTheZeroAddress();
    }

    (bool success, bytes memory result) = to.call{value: value}(data);

    if (!success) {
      // solhint-disable-next-line no-inline-assembly
      assembly {
        revert(add(result, 32), mload(result))
      }
    }
  }
}
