// SPDX-License-Identifier: NONE
pragma solidity ^0.8.20;

import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {Ownable} from "./Ownable.sol";

abstract contract Guarded is Ownable {
  using ECDSA for bytes32;

  // storage

  mapping(address => bool) internal _guardians;

  // events

  event GuardianAdded(address guardian);

  event GuardianRemoved(address guardian);

  // errors

  error MsgSenderIsNotTheContractGuardian();

  error GuardianIsTheZeroAddress();

  error GuardianAlreadyExists();

  error GuardianDoesntExist();

  error InvalidGuardianSignature();

  // deployment

  constructor(address owner) Ownable(owner) {
    //
  }

  // external getters

  function hasGuardian(address guardian) external view returns (bool) {
    return _hasGuardian(guardian);
  }

  // external setters

  function addGuardian(address guardian) external onlyOwner {
    if (guardian == address(0)) {
      revert GuardianIsTheZeroAddress();
    }

    if (_guardians[guardian]) {
      revert GuardianAlreadyExists();
    }

    _guardians[guardian] = true;

    emit GuardianAdded(guardian);
  }

  function removeGuardian(address guardian) external onlyOwner {
    if (guardian == address(0)) {
      revert GuardianIsTheZeroAddress();
    }

    if (!_guardians[guardian]) {
      revert GuardianDoesntExist();
    }

    delete _guardians[guardian];

    emit GuardianRemoved(guardian);
  }

  // internal getters

  function _verifyGuardianSignature(
    bytes32 hash,
    bytes calldata signature
  ) internal view {
    if (!_hasGuardian(hash.recover(signature))) {
      revert InvalidGuardianSignature();
    }
  }

  function _hasGuardian(address guardian) internal view returns (bool) {
    return guardian == _owner || _guardians[guardian];
  }

  // internal setters

  function _addGuardians(address[] calldata guardians) internal {
    uint256 len = guardians.length;

    for (uint256 index; index < len; ) {
      address guardian = guardians[index];

      if (guardian == address(0)) {
        revert GuardianIsTheZeroAddress();
      }

      if (_guardians[guardian]) {
        revert GuardianAlreadyExists();
      }

      _guardians[guardian] = true;

      unchecked {
        index += 1;
      }
    }
  }
}
