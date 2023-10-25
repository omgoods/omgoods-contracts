// SPDX-License-Identifier: None
pragma solidity 0.8.21;

import {TokenFactory} from "../TokenFactory.sol";
import {BasicTokenImpl} from "./BasicTokenImpl.sol";

contract BasicTokenFactory is TokenFactory {
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
    string calldata name,
    string calldata symbol,
    address owner,
    address controller,
    bool locked,
    bytes calldata guardianSignature
  ) external {
    _createToken(
      keccak256(abi.encodePacked(symbol)),
      abi.encodeCall(
        BasicTokenImpl.initialize,
        (
          _gateway, //
          name,
          symbol,
          owner,
          controller,
          locked
        )
      ),
      guardianSignature
    );
  }
}
