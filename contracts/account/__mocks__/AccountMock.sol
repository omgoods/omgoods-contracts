// SPDX-License-Identifier: None
pragma solidity 0.8.21;

import {Account} from "../Account.sol";

contract AccountMock is Account {
  // events

  event Initialized(
    address gateway,
    address entryPoint,
    address accountRegistry
  );

  // deployment

  function initialize(
    address gateway,
    address entryPoint,
    address accountRegistry
  ) external {
    _initialize(gateway, entryPoint, accountRegistry);

    emit Initialized(gateway, entryPoint, accountRegistry);
  }
}
