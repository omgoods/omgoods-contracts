// SPDX-License-Identifier: None
pragma solidity 0.8.27;

import {Ownable} from "./Ownable.sol";

abstract contract Guarded is Ownable {
  // storage

  mapping(address => bool) private _guardians;

  // events

  event GuardianAdded(address guardian);

  event GuardianRemoved(address guardian);

  // errors

  error GuardianIsTheZeroAddress();

  error GuardianAlreadyExists();

  error GuardianDoesntExist();

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
    if (guardian == address(0)) {
      revert GuardianIsTheZeroAddress();
    }

    if (!_guardians[guardian]) {
      revert GuardianDoesntExist();
    }

    _guardians[guardian] = false;

    emit GuardianRemoved(guardian);
  }

  // internal getters

  function _isGuardian(address guardian) internal view returns (bool) {
    return guardian == _getOwner() || _guardians[guardian];
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
    if (guardian == address(0)) {
      revert GuardianIsTheZeroAddress();
    }

    if (_guardians[guardian]) {
      revert GuardianAlreadyExists();
    }

    _guardians[guardian] = true;
  }
}
