// SPDX-License-Identifier: None
pragma solidity 0.8.28;

interface IOwnable {
  // external getters

  function getOwner() external view returns (address);
}
