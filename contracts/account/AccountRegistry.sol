// SPDX-License-Identifier: NONE
pragma solidity 0.8.20;

import {Context} from "@openzeppelin/contracts/utils/Context.sol";
import {Ownable} from "../common/access/Ownable.sol";
import {ProxyFactory} from "../common/proxy/ProxyFactory.sol";
import {ProxyHelper} from "../common/proxy/ProxyHelper.sol";
import {Initializable} from "../common/utils/Initializable.sol";
import {GatewayRecipient} from "../gateway/GatewayRecipient.sol";
import {IAccountRegistry} from "./IAccountRegistry.sol";
import {AccountImpl} from "./AccountImpl.sol";

contract AccountRegistry is
  Ownable,
  ProxyFactory,
  Initializable,
  GatewayRecipient,
  IAccountRegistry
{
  enum AccountStates {
    Unknown,
    Defined,
    Created
  }

  // storage

  address private _entryPoint;

  address private _accountImpl;

  mapping(address => bytes32) private _accountSalts;

  mapping(address => AccountStates) private _accountStates;

  mapping(address => mapping(address => bool)) private _accountOwners;

  mapping(address => uint256) private _accountOwnersCounters;

  // events

  event Initialized(address gateway, address entryPoint, address accountImpl);

  event AccountCreated(address account);

  // errors

  error MsgSenderIsNotTheAccount();

  error MsgSenderIsNotTheAccountOwner();

  error SaltOwnerIsTheZeroAddress();

  error AccountAlreadyCreated();

  error AccountIsTheZeroAddress();

  error AccountImplIsTheZeroAddress();

  error AccountOwnerAlreadyExists();

  error AccountOwnerDoesntExist();

  error NotEnoughAccountOwners();

  error AccountOwnerIsTheZeroAddress();

  // modifiers

  modifier onlyCreatedAccount() {
    if (_accountStates[msg.sender] != AccountStates.Created) {
      revert MsgSenderIsNotTheAccount();
    }

    _;
  }

  // deployment

  constructor(address owner) Ownable(owner) {
    //
  }

  function initialize(
    address gateway,
    address entryPoint,
    address accountImpl
  ) external onlyOwner initializeOnce {
    if (accountImpl == address(0)) {
      revert AccountImplIsTheZeroAddress();
    }

    _gateway = gateway;

    _entryPoint = entryPoint;

    _accountImpl = accountImpl;

    emit Initialized(gateway, entryPoint, accountImpl);
  }

  // external getters

  function computeAccount(
    address saltOwner
  ) external view returns (address result) {
    if (saltOwner != address(0)) {
      result = _computeAccount(saltOwner);
    }

    return result;
  }

  function isAccountOwner(
    address account,
    address owner
  ) external view override returns (bool result) {
    if (account != address(0) && owner != address(0)) {
      if (_accountStates[account] == AccountStates.Unknown) {
        result = account == _computeAccount(keccak256(abi.encodePacked(owner)));
      } else {
        result = _accountOwners[account][owner];
      }
    }

    return result;
  }

  function getAccountState(
    address account
  ) external view returns (AccountStates) {
    return _accountStates[account];
  }

  // external setters

  function createAccount(address account) external {
    if (account == address(0)) {
      revert AccountIsTheZeroAddress();
    }

    if (!_createAccount(account, _msgSender())) {
      revert AccountAlreadyCreated();
    }
  }

  function forceAccountCreation(
    address saltOwner
  ) external returns (address account) {
    if (saltOwner == address(0)) {
      revert SaltOwnerIsTheZeroAddress();
    }

    bytes32 salt = keccak256(abi.encodePacked(saltOwner));

    account = _computeAccount(salt);

    AccountStates accountState = _accountStates[account];

    if (accountState != AccountStates.Created) {
      if (accountState == AccountStates.Defined) {
        delete _accountSalts[account];
      } else {
        _addAccountOwnerWithoutVerification(account, saltOwner);
      }

      _createAccountProxy(salt);

      _accountStates[account] = AccountStates.Created;

      emit AccountCreated(account);
    }

    return account;
  }

  function addAccountOwner(address account, address owner) external {
    if (account == address(0)) {
      revert AccountIsTheZeroAddress();
    }

    address sender = _msgSender();

    if (_accountStates[account] == AccountStates.Unknown) {
      bytes32 salt = keccak256(abi.encodePacked(sender));

      if (_computeAccount(salt) != account) {
        revert MsgSenderIsNotTheAccountOwner();
      }

      _accountSalts[account] = salt;
      _accountStates[account] = AccountStates.Defined;

      _addAccountOwnerWithoutVerification(account, sender);
    } else if (!_accountOwners[account][sender]) {
      revert MsgSenderIsNotTheAccountOwner();
    }

    _addAccountOwner(account, owner);
  }

  function removeAccountOwner(address account, address owner) external {
    if (account == address(0)) {
      revert AccountIsTheZeroAddress();
    }

    if (!_accountOwners[account][_msgSender()]) {
      revert MsgSenderIsNotTheAccountOwner();
    }

    _removeAccountOwner(account, owner);
  }

  function directAddAccountOwner(address owner) external onlyCreatedAccount {
    _addAccountOwner(msg.sender, owner);
  }

  function directRemoveAccountOwner(address owner) external onlyCreatedAccount {
    _removeAccountOwner(msg.sender, owner);
  }

  function executeAccountTransaction(
    address payable account,
    address to,
    uint256 value,
    bytes calldata data
  ) external {
    if (account == address(0)) {
      revert AccountIsTheZeroAddress();
    }

    _createAccount(account, _msgSender());

    AccountImpl(account).executeTransaction(to, value, data);

    emit AccountTransactionExecuted(account, to, value, data);
  }

  function executeAccountTransactions(
    address payable account,
    address[] calldata to,
    uint256[] calldata value,
    bytes[] calldata data
  ) external {
    if (account == address(0)) {
      revert AccountIsTheZeroAddress();
    }

    _createAccount(account, _msgSender());

    AccountImpl(account).executeTransactions(to, value, data);

    emit AccountTransactionsExecuted(account, to, value, data);
  }

  function emitAccountTransactionExecuted(
    address to,
    uint256 value,
    bytes calldata data
  ) external onlyCreatedAccount {
    emit AccountTransactionExecuted(msg.sender, to, value, data);
  }

  function emitAccountTransactionsExecuted(
    address[] calldata to,
    uint256[] calldata value,
    bytes[] calldata data
  ) external onlyCreatedAccount {
    emit AccountTransactionsExecuted(msg.sender, to, value, data);
  }

  // internal getters

  function _msgSender()
    internal
    view
    override(Context, GatewayRecipient)
    returns (address)
  {
    return GatewayRecipient._msgSender();
  }

  // private getters

  function _computeAccount(address saltOwner) private view returns (address) {
    return _computeAccount(keccak256(abi.encodePacked(saltOwner)));
  }

  function _computeAccount(bytes32 salt) private view returns (address) {
    return ProxyHelper.computeProxy(address(this), _accountImpl, salt);
  }

  // private setters

  function _createAccountProxy(bytes32 salt) private {
    address payable proxy = payable(_createProxy(_accountImpl, salt));

    AccountImpl(proxy).initialize(_gateway, _entryPoint);
  }

  function _createAccount(
    address account,
    address sender
  ) private returns (bool result) {
    AccountStates accountState = _accountStates[account];

    if (
      accountState != AccountStates.Unknown && !_accountOwners[account][sender]
    ) {
      revert MsgSenderIsNotTheAccountOwner();
    }

    if (accountState != AccountStates.Created) {
      bytes32 salt;

      if (accountState == AccountStates.Defined) {
        salt = _accountSalts[account];

        delete _accountSalts[account];
      } else {
        salt = keccak256(abi.encodePacked(sender));

        if (_computeAccount(salt) != account) {
          revert MsgSenderIsNotTheAccountOwner();
        }

        _addAccountOwnerWithoutVerification(account, sender);
      }

      _createAccountProxy(salt);

      _accountStates[account] = AccountStates.Created;

      emit AccountCreated(account);

      result = true;
    }

    return result;
  }

  function _addAccountOwnerWithoutVerification(
    address account,
    address owner
  ) private {
    _accountOwners[account][owner] = true;

    unchecked {
      ++_accountOwnersCounters[account];
    }

    emit AccountOwnerAdded(account, owner);
  }

  function _addAccountOwner(address account, address owner) private {
    if (owner == address(0)) {
      revert AccountOwnerIsTheZeroAddress();
    }

    if (_accountOwners[account][owner]) {
      revert AccountOwnerAlreadyExists();
    }

    _addAccountOwnerWithoutVerification(account, owner);
  }

  function _removeAccountOwner(address account, address owner) private {
    if (owner == address(0)) {
      revert AccountOwnerIsTheZeroAddress();
    }

    if (!_accountOwners[account][owner]) {
      revert AccountOwnerDoesntExist();
    }

    if (_accountOwnersCounters[account] == 1) {
      revert NotEnoughAccountOwners();
    }

    _accountOwners[account][owner] = false;

    unchecked {
      --_accountOwnersCounters[account];
    }

    emit AccountOwnerRemoved(account, owner);
  }
}
