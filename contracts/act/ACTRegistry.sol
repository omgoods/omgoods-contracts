// SPDX-License-Identifier: None
pragma solidity 0.8.28;

contract ACTRegistry {
  // events

  event TokenEvent(address token, bytes data, uint256 timestamp);

  // external setters

  function emitTokenEvent(bytes calldata data) external {
    emit TokenEvent(msg.sender, data, block.timestamp);
  }
}
