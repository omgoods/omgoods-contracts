// SPDX-License-Identifier: None
pragma solidity 0.8.21;

interface ITokenEvents {
  // external setters

  function OwnerUpdated(address owner) external;

  function Unlocked() external;
}
