// SPDX-License-Identifier: None
pragma solidity 0.8.21;

import {TokenImpl} from "../TokenImpl.sol";

abstract contract BasicTokenImpl is TokenImpl {
  // storage

  string private _name;

  string private _symbol;

  address private _controller;

  bool private _locked;

  // events

  event Unlocked();

  // errors

  error MsgSenderIsNotTheController();

  error ExpectedLocked();

  // modifiers

  modifier whenLocked() {
    _requireLocked();

    _;
  }

  modifier onlyOwnerWhenLocked() {
    if (_locked) {
      _checkOwner();
    }

    _;
  }

  modifier onlyController() {
    _checkController();

    _;
  }

  // deployment

  constructor() TokenImpl() {
    //
  }

  function initialize(
    address gateway,
    string calldata name_,
    string calldata symbol_,
    address owner,
    address controller,
    bool locked_
  ) external {
    _initialize(gateway);

    _name = name_;
    _symbol = symbol_;
    _owner = owner;
    _controller = controller;
    _locked = locked_;
  }

  // public getters

  function name() public view virtual returns (string memory) {
    return _name;
  }

  function symbol() public view virtual returns (string memory) {
    return _symbol;
  }

  // external getters

  function getController() external view returns (address) {
    return _controller;
  }

  function locked() external view returns (bool) {
    return _locked;
  }

  // external setters

  function unlock() external onlyOwner whenLocked {
    _locked = false;

    emit Unlocked();

    _notifyTokenRegistry(0x10);
  }

  // private getters

  function _requireLocked() private view {
    if (!_locked) {
      revert ExpectedLocked();
    }
  }

  function _checkController() private view {
    address msgSender = _msgSender();

    if (msgSender != _controller) {
      if (_locked) {
        _checkOwner(msgSender);
      } else {
        revert MsgSenderIsNotTheController();
      }
    }
  }
}
