// SPDX-License-Identifier: None
pragma solidity 0.8.21;

import {ERC20TokenFactory} from "../ERC20TokenFactory.sol";
import {ERC20FixedTokenImpl} from "./ERC20FixedTokenImpl.sol";

contract ERC20FixedTokenFactory is ERC20TokenFactory {
  struct TokenData {
    address owner;
    uint256 totalSupply;
    string name;
    string symbol;
  }

  bytes32 private constant TOKEN_TYPEHASH =
    keccak256(
      "Token(string name,string symbol,address owner,uint256 totalSupply)"
    );

  // events

  event TokenCreated(
    address token,
    string name,
    string symbol,
    address owner,
    uint256 totalSupply
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

  // external setters

  function createToken(
    TokenData calldata tokenData,
    bytes calldata signature
  ) external {
    address token = _createToken(
      keccak256(abi.encodePacked(tokenData.symbol)),
      _hashToken(tokenData),
      signature
    );

    ERC20FixedTokenImpl(token).initialize(
      _gateway,
      tokenData.name,
      tokenData.symbol,
      tokenData.owner,
      tokenData.totalSupply
    );

    emit TokenCreated(
      token,
      tokenData.name,
      tokenData.symbol,
      tokenData.owner,
      tokenData.totalSupply
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
            tokenData.owner,
            tokenData.totalSupply
          )
        )
      );
  }
}
