// SPDX-License-Identifier: None
pragma solidity 0.8.28;

import {SlotAccess} from "./SlotAccess.sol";

abstract contract Initializable {
  // slots

  bytes32 private constant SLOT_INITIALIZED =
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
    SlotAccess.setBool(SLOT_INITIALIZED, initialized);
  }

  function _requireInitializeOnce() internal {
    require(!_isInitialized(), AlreadyInitialized());

    _setInitialized();
  }

  // internal getters

  function _isInitialized() internal view returns (bool) {
    return SlotAccess.getBool(SLOT_INITIALIZED);
  }
}
