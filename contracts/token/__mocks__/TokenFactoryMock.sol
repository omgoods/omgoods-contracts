// SPDX-License-Identifier: None
pragma solidity 0.8.21;

import {TokenFactory} from "../TokenFactory.sol";
import {TokenImplMock} from "./TokenImplMock.sol";

contract TokenFactoryMock is TokenFactory {
  // deployment

  constructor(
    address owner,
    string memory name,
    string memory version
  ) TokenFactory(owner, name, version) {
    //
  }

  // external getters

  function computeToken(bytes32 salt) external view returns (address) {
    return _computeToken(salt);
  }

  function verifyGuardianSignature(
    bytes32 hash,
    bytes calldata signature
  ) external view {
    _verifyGuardianSignature(hash, signature);
  }

  // external setters

  function addToken(address token) external {
    _tokens[token] = true;
  }

  function createToken(
    bytes32 salt,
    string calldata name,
    string calldata symbol,
    address owner
  ) external returns (address token) {
    token = _createToken(salt);

    TokenImplMock(token).initialize(_gateway, name, symbol, owner);

    return token;
  }
}
