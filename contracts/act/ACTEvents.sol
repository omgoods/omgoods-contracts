// SPDX-License-Identifier: None
pragma solidity 0.8.28;

interface ACTEvents {
  function Received(address sender, uint256 value) external view;

  function BecameReady() external view;

  function RegistryUpdated(address registry) external view;
}
