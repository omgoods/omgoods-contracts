// SPDX-License-Identifier: None
pragma solidity 0.8.21;

import {GatewayRecipient} from "../gateway/GatewayRecipient.sol";

abstract contract Ownable is GatewayRecipient {
  // storage

  address internal _owner;

  // events

  event OwnerUpdated(address owner);

  // errors

  error MsgSenderIsNotTheContractOwner();

  error OwnerIsTheZeroAddress();

  // modifiers

  modifier onlyOwner() {
    if (_msgSender() != _owner) {
      revert MsgSenderIsNotTheContractOwner();
    }

    _;
  }

  // deployment

  constructor(address owner) {
    _owner = owner == address(0) ? msg.sender : owner;
  }

  // external getters

  function getOwner() external view returns (address) {
    return _owner;
  }

  // external setters

  function setOwner(address owner) external onlyOwner {
    _setOwner(owner);
  }

  // internal setters

  function _setOwner(address owner) internal virtual {
    if (owner == address(0)) {
      revert OwnerIsTheZeroAddress();
    }

    _owner = owner;

    emit OwnerUpdated(owner);
  }
}
