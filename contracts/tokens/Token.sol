// SPDX-License-Identifier: None
pragma solidity 0.8.24;

import {Ownable} from "../access/Ownable.sol";
import {Initializable} from "../utils/Initializable.sol";
import {TokenRegistry} from "./TokenRegistry.sol";

abstract contract Token is Ownable, Initializable {
  // storage

  address internal _tokenRegistry;

  bool internal _locked;

  // events

  event Unlocked();

  // errors

  error TokenRegistryIsTheZeroAddress();

  error ExpectedLocked();

  // modifiers

  modifier whenLocked() {
    _requireLocked();

    _;
  }

  modifier onlyOwnerWhenLocked() {
    if (_locked) {
      _checkOwner();
    }

    _;
  }

  // deployment

  function _initialize(
    address forwarder,
    address tokenRegistry,
    bool locked_
  ) internal initializeOnce {
    if (tokenRegistry == address(0)) {
      revert TokenRegistryIsTheZeroAddress();
    }

    _forwarder = forwarder;

    _tokenRegistry = tokenRegistry;

    _locked = locked_;
  }

  // external getters

  function getTokenRegistry() external view returns (address) {
    return _tokenRegistry;
  }

  function locked() external view returns (bool) {
    return _locked;
  }

  // external setters

  function unlock() external onlyOwner whenLocked {
    _locked = false;

    emit Unlocked();

    _notifyTokenRegistry(0x00);
  }

  // internal setters

  function _notifyTokenRegistry(uint8 kind) internal {
    TokenRegistry(_tokenRegistry).sendTokenNotification(kind, new bytes(0));
  }

  function _notifyTokenRegistry(uint8 kind, bytes memory encodedData) internal {
    TokenRegistry(_tokenRegistry).sendTokenNotification(kind, encodedData);
  }

  function _setOwner(address owner, bool emitEvent) internal override {
    super._setOwner(owner, emitEvent);

    if (emitEvent) {
      _notifyTokenRegistry(0x01, abi.encode(owner));
    }
  }

  // private getters

  function _requireLocked() private view {
    if (!_locked) {
      revert ExpectedLocked();
    }
  }
}
