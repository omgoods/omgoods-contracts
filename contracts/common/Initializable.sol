// SPDX-License-Identifier: None
pragma solidity 0.8.28;

import {IInitializable} from "./interfaces/IInitializable.sol";

abstract contract Initializable is IInitializable {
  bool private _initialized;

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

  function _isInitialized() internal view virtual returns (bool) {
    return _initialized;
  }
}
