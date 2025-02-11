// SPDX-License-Identifier: None
pragma solidity 0.8.28;

interface IACTAny {
  // external getters

  function name() external view returns (string memory);

  function symbol() external view returns (string memory);

  function totalSupply() external view returns (uint256);

  function balanceOf(address account) external view returns (uint256);
}
