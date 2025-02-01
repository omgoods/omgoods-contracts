// SPDX-License-Identifier: None
pragma solidity 0.8.28;

import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {Ownable} from "./Ownable.sol";

abstract contract Guarded is Ownable {
  using ECDSA for bytes32;

  // storage

  mapping(address => bool) private _guardians;

  // events

  event GuardianAdded(address guardian);

  event GuardianRemoved(address guardian);

  // errors

  error ZeroAddressGuardian();

  error InvalidGuardian();

  error InvalidGuardianSignature();

  // external getters

  function isGuardian(address guardian) external view returns (bool) {
    return _guardians[guardian];
  }

  // external setters

  function addGuardian(address guardian) external onlyOwner {
    require(guardian != address(0), ZeroAddressGuardian());

    require(!_guardians[guardian], InvalidGuardian());

    _guardians[guardian] = true;

    emit GuardianAdded(guardian);
  }

  function removeGuardian(address guardian) external onlyOwner {
    require(guardian != address(0), ZeroAddressGuardian());

    require(_guardians[guardian], InvalidGuardian());

    _guardians[guardian] = false;

    emit GuardianRemoved(guardian);
  }

  // internal getters

  function _verifyGuardianSignature(
    bytes32 hash,
    bytes calldata signature
  ) internal view {
    address signer = hash.recover(signature);

    require(_guardians[signer], InvalidGuardianSignature());
  }

  // internal setters

  function _setInitialGuardians(address[] calldata guardians) internal {
    uint256 length = guardians.length;

    for (uint256 index; index < length; ) {
      address guardian = guardians[index];

      if (guardian != address(0)) {
        _guardians[guardian] = true;
      }

      unchecked {
        index += 1;
      }
    }
  }
}
