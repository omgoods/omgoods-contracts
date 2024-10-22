// SPDX-License-Identifier: None
pragma solidity 0.8.27;

import {Guarded} from "../Guarded.sol";

contract GuardedMock is Guarded {
  // deployment

  constructor(address guardian) {
    _setInitialOwner(address(0));

    _addGuardian(guardian);
  }

  // external setters

  function setInitialGuardians(address[] calldata guardians) external {
    _setInitialGuardians(guardians);
  }
}
