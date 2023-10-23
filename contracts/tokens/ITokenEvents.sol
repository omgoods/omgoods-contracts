// SPDX-License-Identifier: None
pragma solidity 0.8.21;

interface ITokenEvents {
  // external setters

  function ownerUpdated(address owner) external;

  function unlocked() external;
}
