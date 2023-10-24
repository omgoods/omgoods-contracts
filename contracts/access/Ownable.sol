// SPDX-License-Identifier: None
pragma solidity 0.8.21;

import {GatewayRecipient} from "../gateway/GatewayRecipient.sol";

abstract contract Ownable is GatewayRecipient {
  // storage

  address internal _owner;

  // events

  event OwnerUpdated(address owner);

  // errors

  error MsgSenderIsNotTheOwner();

  error OwnerIsTheZeroAddress();

  // modifiers

  modifier onlyOwner() {
    _checkOwner(_msgSender());
    _;
  }

  // external getters

  function getOwner() external view returns (address) {
    return _owner;
  }

  // external setters

  function setOwner(address owner) external onlyOwner {
    _setOwner(owner);
  }

  // internal getters

  function _checkOwner(address msgSender) internal view {
    if (msgSender != _owner) {
      revert MsgSenderIsNotTheOwner();
    }
  }

  // internal setters

  function _setInitialOwner(address initialOwner) internal {
    _owner = initialOwner == address(0) ? msg.sender : initialOwner;
  }

  function _setOwner(address owner) internal virtual {
    if (owner == address(0)) {
      revert OwnerIsTheZeroAddress();
    }

    _owner = owner;

    emit OwnerUpdated(owner);
  }
}
