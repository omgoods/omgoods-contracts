// SPDX-License-Identifier: None
pragma solidity ^0.8.21;

import {Guarded} from "../Guarded.sol";

contract GuardedMock is Guarded {
  // deployment

  constructor(address guardian) Guarded(address(0)) {
    _guardians[guardian] = true;
  }

  // external getters

  function verifyGuardianSignature(
    bytes32 hash,
    bytes calldata signature
  ) external view returns (bool) {
    _verifyGuardianSignature(hash, signature);

    return true;
  }

  // external setters

  function setGuardians(address[] calldata guardians) external {
    _setGuardians(guardians);
  }
}
