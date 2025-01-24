// SPDX-License-Identifier: None
pragma solidity 0.8.28;

interface ACTEvents {
  function received(address sender, uint256 value) external view;

  function becameReady() external view;

  function registryUpdated(address registry) external view;
}
