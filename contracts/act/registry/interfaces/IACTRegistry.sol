// SPDX-License-Identifier: None
pragma solidity 0.8.28;

interface IACTRegistry {
  // external getters

  function isExtensionEnabled(address extension) external view returns (bool);

  // external setters

  function emitTokenEvent(bytes calldata data) external;
}
