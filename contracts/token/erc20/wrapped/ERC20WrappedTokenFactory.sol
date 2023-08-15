// SPDX-License-Identifier: NONE
pragma solidity 0.8.21;

import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {TokenFactory} from "../../TokenFactory.sol";
import {ERC20WrappedTokenImpl} from "./ERC20WrappedTokenImpl.sol";

contract ERC20WrappedTokenFactory is EIP712, TokenFactory {
  bytes32 private constant TOKEN_TYPE_HASH =
    keccak256("Token(address underlyingToken)");

  // events

  event Initialized(address gateway, address tokenRegistry, address tokenImpl);

  event TokenCreated(address token, address underlyingToken);

  // errors

  error UnderlyingTokenIsTheZeroAddress();

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
    address underlyingToken
  ) external view returns (address) {
    return _computeToken(keccak256(abi.encodePacked(underlyingToken)));
  }

  function hashToken(address underlyingToken) external view returns (bytes32) {
    return _hashToken(underlyingToken);
  }

  // external setters

  function createToken(
    address underlyingToken,
    bytes calldata guardianSignature
  ) external {
    if (underlyingToken == address(0)) {
      revert UnderlyingTokenIsTheZeroAddress();
    }

    address token = _createToken(
      keccak256(abi.encodePacked(underlyingToken)),
      _hashToken(underlyingToken),
      guardianSignature
    );

    ERC20WrappedTokenImpl(token).initialize(
      _gateway,
      _tokenRegistry,
      underlyingToken
    );

    emit TokenCreated(token, underlyingToken);
  }

  // private getters

  function _hashToken(address underlyingToken) private view returns (bytes32) {
    return
      _hashTypedDataV4(keccak256(abi.encode(TOKEN_TYPE_HASH, underlyingToken)));
  }
}
