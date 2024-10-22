// SPDX-License-Identifier: None
pragma solidity 0.8.27;

import {TokenFactory} from "../TokenFactory.sol";
import {TokenDefaultImpl} from "./TokenDefaultImpl.sol";

contract TokenDefaultFactory is TokenFactory {
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
        TokenDefaultImpl.initialize,
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
