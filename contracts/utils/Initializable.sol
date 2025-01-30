// SPDX-License-Identifier: None
pragma solidity 0.8.28;

import {SlotAccess} from "./SlotAccess.sol";

abstract contract Initializable {
  // storage

  bool private _initialized;

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

  function _setInitialized(bool initialized) internal {
    _initialized = initialized;
  }

  function _requireInitializeOnce() internal {
    require(!_isInitialized(), AlreadyInitialized());

    _setInitialized(true);
  }

  // internal getters

  function _isInitialized() internal view returns (bool) {
    return _initialized;
  }
}
