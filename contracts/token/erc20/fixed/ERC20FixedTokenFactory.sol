// SPDX-License-Identifier: NONE
pragma solidity 0.8.20;

import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {TokenFactory} from "../../TokenFactory.sol";
import {ERC20FixedTokenImpl} from "./ERC20FixedTokenImpl.sol";

contract ERC20FixedTokenFactory is EIP712, TokenFactory {
  bytes32 private constant TOKEN_TYPE_HASH =
    keccak256(
      "Token(address owner,string name,string symbol,uint256 totalSupply)"
    );

  // events

  event Initialized(address gateway, address tokenRegistry, address tokenImpl);

  event TokenCreated(
    address token,
    address owner,
    string name,
    string symbol,
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
    address owner,
    string calldata name,
    string calldata symbol,
    uint256 totalSupply
  ) external view returns (bytes32) {
    return _hashToken(owner, name, symbol, totalSupply);
  }

  // external setters

  function createToken(
    address owner,
    string calldata name,
    string calldata symbol,
    uint256 totalSupply,
    bytes calldata guardianSignature
  ) external {
    if (owner == address(0)) {
      revert TokenOwnerIsTheZeroAddress();
    }

    if (totalSupply == 0) {
      revert InsufficientTotalSupply();
    }

    address token = _createToken(
      keccak256(abi.encodePacked(symbol)),
      _hashToken(owner, name, symbol, totalSupply),
      guardianSignature
    );

    ERC20FixedTokenImpl(token).initialize(
      owner,
      _gateway,
      _tokenRegistry,
      name,
      symbol,
      totalSupply
    );

    emit TokenCreated(token, owner, name, symbol, totalSupply);
  }

  // private getters

  function _hashToken(
    address owner,
    string calldata name,
    string calldata symbol,
    uint256 totalSupply
  ) private view returns (bytes32) {
    return
      _hashTypedDataV4(
        keccak256(
          abi.encode(
            TOKEN_TYPE_HASH,
            owner,
            keccak256(abi.encodePacked(name)),
            keccak256(abi.encodePacked(symbol)),
            totalSupply
          )
        )
      );
  }
}
