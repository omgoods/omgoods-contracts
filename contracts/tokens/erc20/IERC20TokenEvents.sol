// SPDX-License-Identifier: None
pragma solidity 0.8.21;

interface IERC20TokenEvents {
  // external setters

  function Transfer(address from, address to, uint256 value) external;

  function Approval(address owner, address spender, uint256 value) external;
}
