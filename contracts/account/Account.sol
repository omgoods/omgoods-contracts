// SPDX-License-Identifier: NONE
pragma solidity 0.8.21;

import {Initializable} from "../common/utils/Initializable.sol";
import {GatewayRecipient} from "../gateway/GatewayRecipient.sol";
import {TokenReceiver} from "../token/TokenReceiver.sol";
import {ERC1271Account} from "./extensions/ERC1271Account.sol";
import {ERC4337Account} from "./extensions/ERC4337Account.sol";
import {IAccountRegistry} from "./IAccountRegistry.sol";

abstract contract Account is
  Initializable,
  GatewayRecipient,
  TokenReceiver,
  ERC1271Account,
  ERC4337Account
{
  // storage

  address private _accountRegistry;

  // events

  event OwnerAdded(address owner);

  event OwnerRemoved(address owner);

  event TransactionExecuted(address to, uint256 value, bytes data);

  event TransactionsExecuted(address[] to, uint256[] value, bytes[] data);

  // errors

  error MsgSenderIsNotTheAccountOwner();

  error EmptyTransactionBatch();

  error InvalidTransactionBatchSize();

  error TransactionToTheZeroAddress();

  error TransactionToInvalidAddress();

  error OwnerIsTheZeroAddress();

  // modifiers

  modifier onlyOwner() {
    _verifyOwner(_msgSender());

    _;
  }

  // deployment

  function _initialize(
    address gateway,
    address entryPoint,
    address accountRegistry
  ) internal initializeOnce {
    _gateway = gateway;

    _entryPoint = entryPoint;

    _accountRegistry = accountRegistry;
  }

  // wildcard

  receive() external payable {
    //
  }

  // external getters

  function getExternalOwners()
    external
    view
    returns (address accountRegistry, address entryPoint)
  {
    return (_accountRegistry, _entryPoint);
  }

  function hasOwner(address owner) external view returns (bool) {
    return _hasOwner(owner);
  }

  // external setters

  function addOwner(address owner) external onlyOwner {
    IAccountRegistry(_accountRegistry).directAddAccountOwner(owner);

    emit OwnerAdded(owner);
  }

  function removeOwner(address owner) external onlyOwner {
    IAccountRegistry(_accountRegistry).directRemoveAccountOwner(owner);

    emit OwnerRemoved(owner);
  }

  function executeTransaction(
    address to,
    uint256 value,
    bytes calldata data
  ) external {
    address sender = _msgSender();

    _verifyOwner(sender);

    _executeTransaction(to, value, data);

    _afterTransactionExecuted(sender, to, value, data);
  }

  function executeTransactions(
    address[] calldata to,
    uint256[] calldata value,
    bytes[] calldata data
  ) external {
    address sender = _msgSender();

    _verifyOwner(sender);

    if (to.length == 0) {
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

  // internal getters

  function _hasOwner(
    address owner
  ) internal view override returns (bool result) {
    return
      IAccountRegistry(_accountRegistry).isAccountOwner(address(this), owner);
  }

  // internal setters

  function _afterTransactionExecuted(
    address sender,
    address to,
    uint256 value,
    bytes memory data
  ) internal override {
    if (sender != _accountRegistry) {
      IAccountRegistry(_accountRegistry).emitAccountTransactionExecuted(
        to,
        value,
        data
      );
    }

    emit TransactionExecuted(to, value, data);
  }

  // private getters

  function _verifyOwner(address sender) private view {
    if (
      sender != address(this) &&
      sender != _accountRegistry &&
      sender != _entryPoint &&
      !_hasOwner(sender)
    ) {
      revert MsgSenderIsNotTheAccountOwner();
    }
  }

  // private setters

  function _executeTransaction(
    address to,
    uint256 value,
    bytes memory data
  ) private {
    if (to == address(0)) {
      revert TransactionToTheZeroAddress();
    }

    if (to == _accountRegistry) {
      revert TransactionToInvalidAddress();
    }

    (bool success, bytes memory response) = to.call{value: value}(data);

    if (!success) {
      // solhint-disable-next-line no-inline-assembly
      assembly {
        revert(add(response, 32), mload(response))
      }
    }
  }
}
