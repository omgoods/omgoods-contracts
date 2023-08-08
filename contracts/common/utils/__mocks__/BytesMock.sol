// SPDX-License-Identifier: NONE
pragma solidity 0.8.20;

import {Bytes} from "../Bytes.sol";

contract BytesMock {
  using Bytes for bytes[];

  // external functions (getters)

  function toKeccak256(bytes[] calldata data) external pure returns (bytes32) {
    return data.toKeccak256();
  }
}
