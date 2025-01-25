// SPDX-License-Identifier: None
pragma solidity 0.8.28;

interface ITokenMetadata {
  // external getters

  function name() external view returns (string memory);

  function symbol() external view returns (string memory);
}
