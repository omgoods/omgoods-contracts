// SPDX-License-Identifier: None
pragma solidity 0.8.27;

import {TokenFactory} from "../TokenFactory.sol";
import {TokenWrappedImpl} from "./TokenWrappedImpl.sol";

contract TokenWrappedFactory is TokenFactory {
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
        TokenWrappedImpl.initialize,
        (
          _forwarder, //
          underlyingToken
        )
      ),
      guardianSignature
    );
  }
}
