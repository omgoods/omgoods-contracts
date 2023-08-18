// SPDX-License-Identifier: None
pragma solidity 0.8.21;

import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {TokenFactory} from "../../TokenFactory.sol";
import {ERC20FixedTokenImpl} from "./ERC20FixedTokenImpl.sol";

contract ERC20FixedTokenFactory is EIP712, TokenFactory {
  struct TokenData {
    address owner;
    uint256 totalSupply;
    string name;
    string symbol;
  }

  bytes32 private constant TOKEN_TYPE_HASH =
    keccak256(
      "Token(string name,string symbol,address owner,uint256 totalSupply)"
    );

  // events

  event Initialized(address gateway, address tokenRegistry, address tokenImpl);

  event TokenCreated(
    address token,
    string name,
    string symbol,
    address owner,
    uint256 totalSupply
  );

  // errors

  error InsufficientTotalSupply();

  // deployment

  constructor(
    address owner,
    string memory name,
    string memory version
  ) TokenFactory(owner) EIP712(name, version) {
    //
  }

  function initialize(
    address gateway,
    address tokenRegistry,
    address tokenImpl
  ) external {
    _initialize(gateway, tokenRegistry, tokenImpl);

    emit Initialized(gateway, tokenRegistry, tokenImpl);
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
    bytes calldata guardianSignature
  ) external {
    if (tokenData.owner == address(0)) {
      revert TokenOwnerIsTheZeroAddress();
    }

    if (tokenData.totalSupply == 0) {
      revert InsufficientTotalSupply();
    }

    address token = _createToken(
      keccak256(abi.encodePacked(tokenData.symbol)),
      _hashToken(tokenData),
      guardianSignature
    );

    ERC20FixedTokenImpl(token).initialize(
      _gateway,
      _tokenRegistry,
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
            TOKEN_TYPE_HASH,
            keccak256(abi.encodePacked(tokenData.name)),
            keccak256(abi.encodePacked(tokenData.symbol)),
            tokenData.owner,
            tokenData.totalSupply
          )
        )
      );
  }
}
