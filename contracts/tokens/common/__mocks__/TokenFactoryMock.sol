// SPDX-License-Identifier: None
pragma solidity 0.8.21;

import {TokenFactory} from "../TokenFactory.sol";

contract TokenFactoryMock is TokenFactory {
  // deployment

  constructor(address owner) TokenFactory(owner) {
    //
  }

  // external getters

  function computeToken(bytes32 salt) external view returns (address) {
    return _computeToken(salt);
  }

  // external setters

  function createToken(
    bytes32 salt,
    bytes memory initCode,
    bytes calldata guardianSignature
  ) external {
    _createToken(salt, initCode, guardianSignature);
  }
}
