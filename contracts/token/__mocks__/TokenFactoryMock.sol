// SPDX-License-Identifier: NONE
pragma solidity 0.8.20;

import {TokenFactory} from "../TokenFactory.sol";

contract TokenFactoryMock is TokenFactory {
  // events

  event Initialized(address gateway, address tokenRegistry, address tokenImpl);

  event TokenCreated(address token);

  // deployment functions

  constructor() TokenFactory(address(0)) {
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

  // external functions (getters)

  function computeToken(bytes32 tokenSalt) external view returns (address) {
    return _computeToken(tokenSalt);
  }

  // external functions (setters)

  function createToken(
    bytes32 salt,
    bytes32 initHash,
    bytes calldata guardianSignature
  ) external {
    address token = _createToken(salt, initHash, guardianSignature);

    emit TokenCreated(token);
  }
}
