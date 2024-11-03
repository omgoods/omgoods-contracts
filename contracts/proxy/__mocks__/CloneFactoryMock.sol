// SPDX-License-Identifier: None
pragma solidity 0.8.27;

import {CloneFactory} from "../CloneFactory.sol";

contract CloneFactoryMock is CloneFactory {
  // deployment

  constructor(address target) CloneFactory(target) {
    //
  }

  // external getters

  function computeClone(bytes32 salt) external view returns (address) {
    return _computeClone(salt);
  }

  // external setters

  function createClone(
    bytes32 salt,
    address impl,
    bytes memory initData
  ) external returns (address) {
    return _createClone(salt, impl, initData);
  }
}
