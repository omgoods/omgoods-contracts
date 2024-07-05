// SPDX-License-Identifier: None
pragma solidity 0.8.24;

import {TokenFactory} from "../TokenFactory.sol";
import {WrappedTokenImpl} from "./WrappedTokenImpl.sol";

contract WrappedTokenFactory is TokenFactory {
  // deployment

  constructor(address owner) TokenFactory(owner) {
    //
  }

  // external getters

  function computeToken(
    address underlyingToken
  ) external view returns (address) {
    return _computeToken(keccak256(abi.encodePacked(underlyingToken)));
  }

  // external setters

  function createToken(
    address underlyingToken,
    bytes calldata guardianSignature
  ) external {
    _createToken(
      keccak256(abi.encodePacked(underlyingToken)),
      abi.encodeCall(
        WrappedTokenImpl.initialize,
        (
          _forwarder, //
          underlyingToken
        )
      ),
      guardianSignature
    );
  }
}
