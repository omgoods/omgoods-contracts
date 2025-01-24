// SPDX-License-Identifier: None
pragma solidity 0.8.28;

import {StorageSlot} from "@openzeppelin/contracts/utils/StorageSlot.sol";

abstract contract Initializable {
  bytes32 private constant INITIALIZED_SLOT =
    keccak256(abi.encodePacked("Initializable#initialized"));

  // errors

  error AlreadyInitialized();

  // modifiers

  modifier initializeOnce() {
    _requireInitializeOnce();

    _;
  }

  // external getters

  function isInitialized() external view returns (bool) {
    return _isInitialized();
  }

  // internal setters

  function _setInitialized() internal {
    _setInitialized(true);
  }

  function _setInitialized(bool initialized) internal {
    StorageSlot.getBooleanSlot(INITIALIZED_SLOT).value = initialized;
  }

  function _requireInitializeOnce() internal {
    require(!_isInitialized(), AlreadyInitialized());

    _setInitialized();
  }

  // internal getters

  function _isInitialized() internal view returns (bool) {
    return StorageSlot.getBooleanSlot(INITIALIZED_SLOT).value;
  }
}
