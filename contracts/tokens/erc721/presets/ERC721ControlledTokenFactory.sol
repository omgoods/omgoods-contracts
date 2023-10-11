// SPDX-License-Identifier: None
pragma solidity 0.8.21;

import {ERC721TokenFactory} from "../ERC721TokenFactory.sol";
import {ERC721ControlledTokenImpl} from "./ERC721ControlledTokenImpl.sol";

contract ERC721ControlledTokenFactory is ERC721TokenFactory {
  struct TokenData {
    string name;
    string symbol;
    address[] controllers;
  }

  bytes32 private constant TOKEN_TYPEHASH =
    keccak256("Token(string name,string symbol,address[] controllers)");

  // events

  event TokenCreated(
    address token,
    string name,
    string symbol,
    address[] controllers
  );

  // errors

  error NotEnoughTokenControllers();

  // deployment

  constructor(
    address owner,
    string memory name
  ) ERC721TokenFactory(owner, name) {
    //
  }

  // external getters

  function computeToken(
    string calldata symbol
  ) external view returns (address) {
    return _computeToken(keccak256(abi.encodePacked(symbol)));
  }

  function hashToken(
    TokenData calldata tokenData
  ) external view returns (bytes32) {
    return _hashToken(tokenData);
  }

  // external setters

  function createToken(
    TokenData calldata tokenData,
    bytes calldata signature
  ) external {
    if (tokenData.controllers.length == 0) {
      revert NotEnoughTokenControllers();
    }

    _verifyGuardianSignature(_hashToken(tokenData), signature);

    address token = _createToken(keccak256(abi.encodePacked(tokenData.symbol)));

    ERC721ControlledTokenImpl(token).initialize(
      _gateway,
      tokenData.name,
      tokenData.symbol,
      tokenData.controllers
    );

    emit TokenCreated(
      token,
      tokenData.name,
      tokenData.symbol,
      tokenData.controllers
    );
  }

  // private getters

  function _hashToken(
    TokenData calldata tokenData
  ) private view returns (bytes32) {
    return
      _hashTypedDataV4(
        keccak256(
          abi.encode(
            TOKEN_TYPEHASH,
            keccak256(abi.encodePacked(tokenData.name)),
            keccak256(abi.encodePacked(tokenData.symbol)),
            keccak256(abi.encodePacked(tokenData.controllers))
          )
        )
      );
  }
}
