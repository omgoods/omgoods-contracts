// SPDX-License-Identifier: None
pragma solidity 0.8.21;

import {Ownable} from "../../access/Ownable.sol";
import {Initializable} from "../../utils/Initializable.sol";
import {TokenRegistry} from "./TokenRegistry.sol";
import {TokenEvents} from "./TokenEvents.sol";

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

  function getTokenRegistry() external view virtual returns (address) {
    return _tokenRegistry;
  }

  // internal setters

  function _emitTokenRegistryEvent(bytes memory encodedEvent) internal {
    TokenRegistry(_tokenRegistry).emitTokenEvent(encodedEvent);
  }

  function _setOwner(address owner) internal override {
    super._setOwner(owner);

    _emitTokenRegistryEvent(abi.encodeCall(TokenEvents.ownerUpdated, (owner)));
  }
}
