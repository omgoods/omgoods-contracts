// SPDX-License-Identifier: None
pragma solidity 0.8.27;

import {Ownable} from "../Ownable.sol";

contract OwnableMock is Ownable {
  // deployment

  constructor() {
    _setInitialOwner();
  }

  // external getters

  function requireOnlyOwner(address msgSender) external view {
    if (msgSender == address(0)) {
      _requireOnlyOwner();
    } else {
      _requireOnlyOwner(msgSender);
    }
  }
  // external setters

  function setInitialOwner(address initialOwner) external {
    if (initialOwner == address(0)) {
      _setInitialOwner();
    } else {
      _setInitialOwner(initialOwner);
    }
  }
}
