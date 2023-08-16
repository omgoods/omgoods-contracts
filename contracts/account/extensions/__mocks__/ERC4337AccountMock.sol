// SPDX-License-Identifier: NONE
pragma solidity 0.8.21;

import {AccountExtensionMock} from "./AccountExtensionMock.sol";
import {ERC4337Account} from "../ERC4337Account.sol";

contract ERC4337AccountMock is AccountExtensionMock, ERC4337Account {
  // deployment

  constructor(address entryPoint) AccountExtensionMock() {
    _entryPoint = entryPoint;
  }

  // wildcard

  receive() external payable {
    //
  }

  // external setters

  function setEntryPoint(address entryPoint) external {
    _entryPoint = entryPoint;
  }
}
