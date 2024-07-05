// SPDX-License-Identifier: None
pragma solidity 0.8.24;

abstract contract Initializable {
  // storage

  bool internal _initialized;

  // errors

  error AlreadyInitialized();

  // modifiers

  modifier initializeOnce() {
    if (_initialized) {
      revert AlreadyInitialized();
    }

    _initialized = true;

    _;
  }

  // external getters

  function initialized() external view returns (bool) {
    return _initialized;
  }
}
