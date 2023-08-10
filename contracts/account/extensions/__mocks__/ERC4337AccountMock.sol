// SPDX-License-Identifier: NONE
pragma solidity 0.8.20;

import {AccountExtensionMock} from "./AccountExtensionMock.sol";
import {ERC4337Account} from "../ERC4337Account.sol";

contract ERC4337AccountMock is AccountExtensionMock, ERC4337Account {
  // deployment functions

  constructor(address entryPoint) AccountExtensionMock() {
    _entryPoint = entryPoint;
  }

  // wildcard functions

  receive() external payable {
    //
  }
}
