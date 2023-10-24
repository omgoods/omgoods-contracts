// SPDX-License-Identifier: None
pragma solidity 0.8.21;

import {TokenImpl} from "../TokenImpl.sol";

contract BasicTokenImpl is TokenImpl {
  // storage

  string private _name;

  string private _symbol;

  address private _controller;

  bool private _unlocked;

  // events

  event Unlocked();

  // errors

  error MsgSenderIsNotTheController();

  error ExpectedUnlocked();

  error ExpectedLocked();

  error AlreadyUnlocked();

  // modifiers

  modifier whenUnlocked() {
    if (!_unlocked) {
      revert ExpectedUnlocked();
    }

    _;
  }

  modifier whenLocked() {
    if (_unlocked) {
      revert ExpectedLocked();
    }

    _;
  }

  modifier onlyController() {
    _checkController(_msgSender());
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
    bool unlocked_
  ) external {
    _initialize(gateway);

    _name = name_;
    _symbol = symbol_;
    _owner = owner;
    _controller = controller;
    _unlocked = unlocked_;
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

  function unlocked() external view returns (bool) {
    return _unlocked;
  }

  // external setters

  function unlock() external onlyOwner {
    if (_unlocked) {
      revert AlreadyUnlocked();
    }

    _unlocked = true;

    emit Unlocked();

    _emitTokenRegistryEvent(0x10);
  }

  // private getters

  function _checkController(address msgSender) private view {
    if (msgSender != _controller) {
      if (_unlocked) {
        revert MsgSenderIsNotTheController();
      } else {
        _checkOwner(msgSender);
      }
    }
  }
}
