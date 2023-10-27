// SPDX-License-Identifier: None
pragma solidity 0.8.21;

import {Ownable} from "../access/Ownable.sol";
import {Initializable} from "../utils/Initializable.sol";
import {TokenRegistry} from "./TokenRegistry.sol";

abstract contract Token is Ownable, Initializable {
  // storage

  address internal _tokenRegistry;

  // errors

  error TokenRegistryIsTheZeroAddress();

  // deployment

  function _initialize(
    address gateway,
    address tokenRegistry
  ) internal initializeOnce {
    if (tokenRegistry == address(0)) {
      revert TokenRegistryIsTheZeroAddress();
    }

    _gateway = gateway;

    _tokenRegistry = tokenRegistry;
  }

  // external getters

  function getTokenRegistry() external view virtual returns (address) {
    return _tokenRegistry;
  }

  // internal setters

  function _notifyTokenRegistry(uint8 kind, bytes memory encodedData) internal {
    TokenRegistry(_tokenRegistry).sendTokenNotification(kind, encodedData);
  }

  function _setOwner(address owner, bool emitEvent) internal override {
    super._setOwner(owner, emitEvent);

    if (emitEvent) {
      _notifyTokenRegistry(0x00, abi.encode(owner));
    }
  }
}
