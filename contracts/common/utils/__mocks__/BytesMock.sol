// SPDX-License-Identifier: NONE
pragma solidity 0.8.21;

import {Bytes} from "../Bytes.sol";

contract BytesMock {
  using Bytes for bytes[];

  // external getters

  function deepKeccak256(
    bytes[] calldata data
  ) external pure returns (bytes32) {
    return data.deepKeccak256();
  }
}
