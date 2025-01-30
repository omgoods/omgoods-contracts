// SPDX-License-Identifier: None
pragma solidity 0.8.28;

interface IACTRegistry {
  // external setters

  function emitTokenEvent(bytes calldata data) external;
}
