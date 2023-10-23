// SPDX-License-Identifier: None
pragma solidity 0.8.21;

import {Ownable} from "../access/Ownable.sol";
import {Initializable} from "../utils/Initializable.sol";
import {TokenRegistry} from "./TokenRegistry.sol";
import {ITokenEvents} from "./ITokenEvents.sol";

abstract contract Token is Ownable, Initializable {
  // storage

  TokenRegistry internal _tokenRegistry;

  bool internal _locked;

  // events

  event Unlocked();

  // errors

  error TokenRegistryIsTheZeroAddress();

  error ExpectedLocked();

  error ExpectedUnlocked();

  // modifiers

  modifier whenLocked() {
    if (!_locked) {
      revert ExpectedLocked();
    }

    _;
  }

  modifier whenUnlocked() {
    if (_locked && _msgSender() != _owner) {
      revert ExpectedUnlocked();
    }

    _;
  }

  // deployment

  constructor(address owner) Ownable(owner) {
    //
  }

  function _initialize(
    address gateway,
    address tokenRegistry
  ) internal initializeOnce {
    if (tokenRegistry == address(0)) {
      revert TokenRegistryIsTheZeroAddress();
    }

    _gateway = gateway;

    _tokenRegistry = TokenRegistry(tokenRegistry);
  }

  function _initialize(address gateway) internal initializeOnce {
    _gateway = gateway;

    _tokenRegistry = TokenRegistry(msg.sender);
  }

  // external getters

  function isUnlocked() external view returns (bool) {
    return !_locked;
  }

  function getTokenRegistry() external view virtual returns (address) {
    return address(_tokenRegistry);
  }

  // external setters

  function unlock() external onlyOwner whenLocked {
    _locked = false;

    emit Unlocked();

    _tokenRegistry.emitTokenEvent(abi.encodeCall(ITokenEvents.unlocked, ()));
  }

  // internal setters

  function _setOwner(address owner) internal override {
    super._setOwner(owner);

    _tokenRegistry.emitTokenEvent(
      abi.encodeCall(ITokenEvents.ownerUpdated, (owner))
    );
  }
}
