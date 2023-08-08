// SPDX-License-Identifier: NONE
pragma solidity ^0.8.20;

import {Guarded} from "../Guarded.sol";

contract GuardedMock is Guarded {
  // deployment functions

  constructor() Guarded(address(0)) {
    //
  }

  // external functions (setters)

  function setGuardians(address[] calldata guardians) external {
    _setGuardians(guardians);
  }
}
