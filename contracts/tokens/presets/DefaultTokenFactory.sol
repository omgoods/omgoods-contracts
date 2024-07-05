// SPDX-License-Identifier: None
pragma solidity 0.8.24;

import {TokenFactory} from "../TokenFactory.sol";
import {DefaultTokenImpl} from "./DefaultTokenImpl.sol";

contract DefaultTokenFactory is TokenFactory {
  // deployment

  constructor(address owner) TokenFactory(owner) {
    //
  }

  // external getters

  function computeToken(
    string calldata symbol
  ) external view returns (address) {
    return _computeToken(keccak256(abi.encodePacked(symbol)));
  }

  // external setters

  function createToken(
    address owner,
    string calldata name,
    string calldata symbol,
    address controller,
    bool locked,
    bytes calldata guardianSignature
  ) external {
    _createToken(
      keccak256(abi.encodePacked(symbol)),
      abi.encodeCall(
        DefaultTokenImpl.initialize,
        (
          _forwarder, //
          owner,
          name,
          symbol,
          controller,
          locked
        )
      ),
      guardianSignature
    );
  }
}
