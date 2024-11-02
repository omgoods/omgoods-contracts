// SPDX-License-Identifier: None
pragma solidity 0.8.27;

import {ForwarderContext} from "../metatx/ForwarderContext.sol";

abstract contract Ownable is ForwarderContext {
  // storage

  address private _owner;

  // events

  event OwnerUpdated(address owner);

  // errors

  error MsgSenderIsNotTheOwner();

  error OwnerIsTheZeroAddress();

  // modifiers

  modifier onlyOwner() {
    _checkOwner();

    _;
  }

  // external getters

  function getOwner() external view returns (address) {
    return _getOwner();
  }

  // external setters

  function setOwner(address owner) external onlyOwner {
    _setOwner(owner, true);
  }

  // internal getters

  function _getOwner() internal view returns (address) {
    return _owner;
  }

  function _checkOwner() internal view {
    _checkOwner(_msgSender());
  }

  function _checkOwner(address msgSender) internal view {
    if (msgSender != _owner) {
      revert MsgSenderIsNotTheOwner();
    }
  }

  // internal setters

  function _setInitialOwner() internal {
    _setInitialOwner(msg.sender);
  }
  function _setInitialOwner(address initialOwner) internal {
    _owner = initialOwner == address(0) ? msg.sender : initialOwner;
  }

  function _setOwner(address owner, bool emitEvent) internal virtual {
    if (owner == address(0)) {
      revert OwnerIsTheZeroAddress();
    }

    _owner = owner;

    if (emitEvent) {
      emit OwnerUpdated(owner);
    }
  }
}
