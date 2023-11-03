// SPDX-License-Identifier: None
pragma solidity 0.8.21;

import {TokenImpl} from "../TokenImpl.sol";

abstract contract DefaultTokenImpl is TokenImpl {
  // storage

  string private _name;

  string private _symbol;

  address private _controller;

  // errors

  error MsgSenderIsNotTheController();

  // modifiers

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
    address owner,
    string calldata name_,
    string calldata symbol_,
    address controller,
    bool locked
  ) external {
    _initialize(gateway, locked);

    _setOwner(owner, false);

    _name = name_;
    _symbol = symbol_;

    _controller = controller;
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

  // private getters

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
