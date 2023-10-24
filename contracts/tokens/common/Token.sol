// SPDX-License-Identifier: None
pragma solidity 0.8.21;

import {Ownable} from "../../access/Ownable.sol";
import {Initializable} from "../../utils/Initializable.sol";
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

  function getTokenRegistry() external view virtual returns (address) {
    return _tokenRegistry;
  }

  // internal setters

  function _emitTokenRegistryEvent(uint8 kind) internal {
    _emitTokenRegistryEvent(kind, new bytes(0));
  }

  function _emitTokenRegistryEvent(uint8 kind, bytes memory encoded) internal {
    TokenRegistry(_tokenRegistry).emitTokenEvent(kind, encoded);
  }

  function _setOwner(address owner) internal override {
    super._setOwner(owner);

    _emitTokenRegistryEvent(0x00, abi.encode(owner));
  }
}
