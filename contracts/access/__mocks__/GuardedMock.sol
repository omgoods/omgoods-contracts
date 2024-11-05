// SPDX-License-Identifier: None
pragma solidity 0.8.27;

import {Guarded} from "../Guarded.sol";

contract GuardedMock is Guarded {
  // deployment

  constructor(address guardian) {
    _setInitialOwner();

    _addGuardian(guardian);
  }

  // external getters

  function verifyGuardianSignature(
    bytes32 hash,
    bytes calldata signature
  ) external view {
    _verifyGuardianSignature(hash, signature);
  }

  // external setters

  function setInitialGuardians(address[] calldata guardians) external {
    _setInitialGuardians(guardians);
  }
}
