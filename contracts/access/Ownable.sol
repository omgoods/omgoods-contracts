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
    _requireOnlyOwner();

    _;
  }

  // external getters

  function getOwner() external view returns (address) {
    return _getOwner();
  }

  // external setters

  function setOwner(address owner) external onlyOwner {
    require(owner != address(0), OwnerIsTheZeroAddress());

    _setOwner(owner);
    _afterOwnerUpdated(owner);
  }

  // internal getters

  function _getOwner() internal view returns (address) {
    return _owner;
  }

  function _requireOnlyOwner() internal view {
    _requireOnlyOwner(_msgSender());
  }

  function _requireOnlyOwner(address msgSender) internal view {
    require(_getOwner() == msgSender, MsgSenderIsNotTheOwner());
  }

  // internal setters

  function _setInitialOwner() internal {
    _setInitialOwner(address(0));
  }

  function _setInitialOwner(address owner) internal {
    _setOwner(owner == address(0) ? msg.sender : owner);
  }

  function _setOwner(address owner) internal {
    _owner = owner;
  }

  function _afterOwnerUpdated(address owner) internal virtual {
    emit OwnerUpdated(owner);
  }
}
