// SPDX-License-Identifier: None
pragma solidity 0.8.28;

interface IOwnable {
  // errors

  error ZeroAddressOwner();

  // external getters

  function getOwner() external view returns (address);
}
