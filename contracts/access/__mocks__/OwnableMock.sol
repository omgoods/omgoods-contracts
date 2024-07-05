// SPDX-License-Identifier: None
pragma solidity 0.8.24;

import {Ownable} from "../Ownable.sol";

contract OwnableMock is Ownable {
  // deployment

  constructor() {
    _setInitialOwner(address(0));
  }

  // external setters

  function setInitialOwner(address initialOwner) external {
    _setInitialOwner(initialOwner);
  }
}
