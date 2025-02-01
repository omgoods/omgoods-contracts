// SPDX-License-Identifier: None
pragma solidity 0.8.28;

abstract contract Ownable {
  // storage

  address internal _owner;

  // events

  event OwnerUpdated(address owner);

  // errors

  error MsgSenderIsNotTheOwner();

  error ZeroAddressOwner();

  // modifiers

  modifier onlyOwner() {
    require(msg.sender == _owner, MsgSenderIsNotTheOwner());

    _;
  }

  // external getters

  function getOwner() external view returns (address) {
    return _owner;
  }

  // external setters

  function setOwner(address owner) external onlyOwner {
    require(owner != address(0), ZeroAddressOwner());

    _owner = owner;

    emit OwnerUpdated(owner);
  }

  // internal setters

  function _setInitialOwner(address owner) internal {
    _owner = owner == address(0) ? msg.sender : owner;
  }
}
