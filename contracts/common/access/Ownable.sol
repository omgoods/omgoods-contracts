// SPDX-License-Identifier: NONE
pragma solidity 0.8.20;

import {Context} from "@openzeppelin/contracts/utils/Context.sol";

abstract contract Ownable is Context {
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

  // deployment functions

  constructor(address owner) {
    _owner = owner == address(0) ? msg.sender : owner;
  }

  // external functions (getters)

  function getOwner() external view returns (address) {
    return _owner;
  }

  // external functions (setters)

  function setOwner(address owner) external onlyOwner {
    if (owner == address(0)) {
      revert OwnerIsTheZeroAddress();
    }

    _afterOwnerUpdated(owner);
  }

  // internal functions (setters)

  function _afterOwnerUpdated(address owner) internal virtual {
    emit OwnerUpdated(owner);
  }
}
