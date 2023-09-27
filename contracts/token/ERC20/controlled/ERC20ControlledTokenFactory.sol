// SPDX-License-Identifier: None
pragma solidity 0.8.21;

import {ERC20TokenFactory} from "../ERC20TokenFactory.sol";
import {ERC20ControlledTokenImpl} from "./ERC20ControlledTokenImpl.sol";

contract ERC20ControlledTokenFactory is ERC20TokenFactory {
  struct TokenData {
    string name;
    string symbol;
    address controller;
  }

  bytes32 private constant TOKEN_TYPEHASH =
    keccak256("Token(string name,string symbol,address controller)");

  // events

  event TokenCreated(
    address token,
    string name,
    string symbol,
    address controller
  );

  // deployment

  constructor(
    address owner,
    string memory name,
    string memory version
  ) ERC20TokenFactory(owner, name, version) {
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
    _verifyGuardianSignature(_hashToken(tokenData), signature);

    address token = _createToken(keccak256(abi.encodePacked(tokenData.symbol)));

    ERC20ControlledTokenImpl(token).initialize(
      _gateway,
      tokenData.name,
      tokenData.symbol,
      tokenData.controller
    );

    emit TokenCreated(
      token,
      tokenData.name,
      tokenData.symbol,
      tokenData.controller
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
            tokenData.controller
          )
        )
      );
  }
}
