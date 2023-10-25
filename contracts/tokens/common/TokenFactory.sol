// SPDX-License-Identifier: None
pragma solidity 0.8.21;

import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";
import {Ownable} from "../../access/Ownable.sol";
import {Initializable} from "../../utils/Initializable.sol";
import {TokenRegistry} from "./TokenRegistry.sol";

abstract contract TokenFactory is Ownable, Initializable {
  // storage

  address private _tokenImpl;

  TokenRegistry private _tokenRegistry;

  // errors

  error TokenImplIsTheZeroAddress();

  error TokenRegistryIsTheZeroAddress();

  // deployment

  constructor(address owner) {
    _setInitialOwner(owner);
  }

  function _initialize(
    address gateway,
    address tokenImpl,
    address tokenRegistry
  ) internal initializeOnce onlyOwner {
    if (tokenImpl == address(0)) {
      revert TokenImplIsTheZeroAddress();
    }

    if (tokenRegistry == address(0)) {
      revert TokenRegistryIsTheZeroAddress();
    }

    _gateway = gateway;
    _tokenImpl = tokenImpl;
    _tokenRegistry = TokenRegistry(tokenRegistry);
  }

  // external getters

  function getTokenImpl() external view returns (address) {
    return _tokenImpl;
  }

  function getTokenRegistry() external view returns (address) {
    return address(_tokenRegistry);
  }

  // internal getters

  function _computeToken(bytes32 salt) internal view returns (address) {
    return
      Clones.predictDeterministicAddress(
        _tokenImpl,
        salt,
        address(_tokenRegistry)
      );
  }

  // internal setters

  function _createToken(
    bytes32 salt,
    bytes memory initCode,
    bytes calldata guardianSignature
  ) internal {
    if (_msgSender() == _owner) {
      _tokenRegistry.createToken(_tokenImpl, salt, initCode);
    } else {
      _tokenRegistry.createToken(_tokenImpl, salt, initCode, guardianSignature);
    }
  }
}
