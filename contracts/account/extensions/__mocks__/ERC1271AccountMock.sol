// SPDX-License-Identifier: NONE
pragma solidity 0.8.20;

import {AccountExtensionMock} from "./AccountExtensionMock.sol";
import {ERC1271Account} from "../ERC1271Account.sol";

contract ERC1271AccountMock is AccountExtensionMock, ERC1271Account {
  // deployment functions

  constructor() AccountExtensionMock() {
    //
  }
}
