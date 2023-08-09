// SPDX-License-Identifier: NONE
pragma solidity ^0.8.20;

import {Guarded} from "../Guarded.sol";

contract GuardedMock is Guarded {
  // deployment functions

  constructor() Guarded(address(0)) {
    //
  }

  // external functions (getters)

  function verifyGuardianSignature(
    bytes32 hash,
    bytes calldata signature
  ) external view returns (bool) {
    _verifyGuardianSignature(hash, signature);

    return true;
  }

  // external functions (setters)

  function addGuardians(address[] calldata guardians) external {
    _addGuardians(guardians);
  }
}
