// SPDX-License-Identifier: None
pragma solidity 0.8.28;

interface IInitializable {
  // errors

  error AlreadyInitialized();

  // external getters

  function isInitialized() external view returns (bool);
}
