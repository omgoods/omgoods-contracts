// SPDX-License-Identifier: None
pragma solidity 0.8.28;

import {IOwnable} from "./interfaces/IOwnable.sol";

abstract contract Ownable is IOwnable {
  // storage

  address internal _owner;

  // errors

  error MsgSenderIsNotTheOwner();

  error ZeroAddressOwner();

  // events

  event OwnerUpdated(address owner);

  // modifiers

  modifier onlyOwner() {
    _requireOnlyOwner();

    _;
  }

  // external getters

  function getOwner() external view returns (address) {
    return _owner;
  }

  // external setters

  function setOwner(address owner) external onlyOwner returns (bool) {
    require(owner != address(0), ZeroAddressOwner());

    if (_owner == owner) {
      return false;
    }

    _owner = owner;

    emit OwnerUpdated(owner);

    return true;
  }

  // internal getters

  function _requireOnlyOwner() internal view {
    require(msg.sender == _owner, MsgSenderIsNotTheOwner());
  }

  // internal setters

  function _setInitialOwner(address owner) internal returns (address) {
    if (owner == address(0)) {
      owner = msg.sender;
    }

    _owner = owner;

    return owner;
  }
}
