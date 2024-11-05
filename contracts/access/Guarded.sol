// SPDX-License-Identifier: None
pragma solidity 0.8.27;

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

  error GuardianIsTheZeroAddress();

  error GuardianAlreadyExists();

  error GuardianDoesntExist();

  error InvalidGuardianSignature();

  // external getters

  function isGuardian(address guardian) external view returns (bool) {
    return _isGuardian(guardian);
  }

  // external setters

  function addGuardian(address guardian) external onlyOwner {
    _addGuardian(guardian);

    emit GuardianAdded(guardian);
  }

  function removeGuardian(address guardian) external onlyOwner {
    _removeGuardian(guardian);

    emit GuardianRemoved(guardian);
  }

  // internal getters

  function _isGuardian(address guardian) internal view returns (bool) {
    return guardian == _getOwner() || _guardians[guardian];
  }

  function _verifyGuardianSignature(
    bytes32 hash,
    bytes calldata signature
  ) internal view {
    address signer = hash.recover(signature);

    require(_isGuardian(signer), InvalidGuardianSignature());
  }

  // internal setters

  function _setInitialGuardians(address[] calldata guardians) internal {
    uint256 len = guardians.length;

    for (uint256 index; index < len; ) {
      _addGuardian(guardians[index]);

      unchecked {
        index += 1;
      }
    }
  }

  function _addGuardian(address guardian) internal {
    require(guardian != address(0), GuardianIsTheZeroAddress());
    require(!_guardians[guardian], GuardianAlreadyExists());

    _guardians[guardian] = true;
  }

  function _removeGuardian(address guardian) internal {
    require(guardian != address(0), GuardianIsTheZeroAddress());
    require(_guardians[guardian], GuardianDoesntExist());

    _guardians[guardian] = false;
  }
}
