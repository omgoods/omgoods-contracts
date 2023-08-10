// SPDX-License-Identifier: NONE
pragma solidity 0.8.20;

import {Account} from "../Account.sol";

contract AccountMock is Account {
  // events

  event Initialized(
    address gateway,
    address entryPoint,
    address accountRegistry
  );

  // deployment functions

  function initialize(
    address gateway,
    address entryPoint,
    address accountRegistry
  ) external {
    _initialize(gateway, entryPoint, accountRegistry);

    emit Initialized(gateway, entryPoint, accountRegistry);
  }
}
