// SPDX-License-Identifier: None
pragma solidity 0.8.21;

import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {ERC20TokenFactory} from "../ERC20TokenFactory.sol";
import {ERC20WrappedTokenImpl} from "./ERC20WrappedTokenImpl.sol";

contract ERC20WrappedTokenFactory is ERC20TokenFactory {
  bytes32 private constant TOKEN_TYPEHASH =
    keccak256("Token(address underlyingToken)");

  // events

  event TokenCreated(
    address token,
    string name,
    string symbol,
    address underlyingToken
  );

  // errors

  error UnderlyingTokenIsTheZeroAddress();

  error UnsupportedUnderlyingToken();

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
    bytes calldata signature
  ) external {
    if (underlyingToken == address(0)) {
      revert UnderlyingTokenIsTheZeroAddress();
    }

    if (IERC20Metadata(underlyingToken).decimals() != 18) {
      revert UnsupportedUnderlyingToken();
    }

    _verifyGuardianSignature(_hashToken(underlyingToken), signature);

    address token = _createToken(keccak256(abi.encodePacked(underlyingToken)));

    ERC20WrappedTokenImpl(token).initialize(_gateway, underlyingToken);

    emit TokenCreated(
      token,
      ERC20WrappedTokenImpl(token).name(),
      ERC20WrappedTokenImpl(token).symbol(),
      underlyingToken
    );
  }

  // private getters

  function _hashToken(address underlyingToken) private view returns (bytes32) {
    return
      _hashTypedDataV4(keccak256(abi.encode(TOKEN_TYPEHASH, underlyingToken)));
  }
}
