// SPDX-License-Identifier: NONE
pragma solidity 0.8.20;

import {TokenFactory} from "../../TokenFactory.sol";
import {ERC20FixedToken} from "./ERC20FixedToken.sol";

contract ERC20FixedTokenFactory is TokenFactory {
  bytes32 private constant TOKEN_TYPE_HASH =
    keccak256(
      "Token(address owner,string name,string symbol,uint256 totalSupply)"
    );

  // events

  event Initialized(
    address gateway,
    address tokenRegistry,
    address tokenImplementation
  );

  event TokenCreated(
    address token,
    address owner,
    string name,
    string symbol,
    uint256 totalSupply
  );

  // errors

  error InsufficientTotalSupply();

  // deployment functions

  constructor(
    address owner,
    string memory name,
    string memory version
  ) TokenFactory(owner, name, version) {
    //
  }

  function initialize(
    address gateway,
    address tokenRegistry,
    address tokenImplementation
  ) external {
    _initialize(gateway, tokenRegistry, tokenImplementation);

    emit Initialized(gateway, tokenRegistry, tokenImplementation);
  }

  // external functions (getters)

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

  // external functions (setters)

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

    ERC20FixedToken(token).initialize(
      owner,
      _gateway,
      _tokenRegistry,
      name,
      symbol,
      totalSupply
    );

    emit TokenCreated(token, owner, name, symbol, totalSupply);
  }

  // private functions (getters)

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
