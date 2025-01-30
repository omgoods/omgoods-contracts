// SPDX-License-Identifier: None
pragma solidity 0.8.28;

import {ITokenMetadata} from "./ITokenMetadata.sol";

/// @title IERC20 Interface
/// @notice This interface defines the standard ERC20 methods and events,
///         which should be implemented by any ERC20-compliant token.
/// @dev Inherits metadata methods from ITokenMetadata.sol.
interface IERC20 is ITokenMetadata {
  // events

  event Approval(address indexed owner, address indexed spender, uint256 value);

  event Transfer(address indexed from, address indexed to, uint256 value);

  // external getters

  function decimals() external view returns (uint8);

  function totalSupply() external view returns (uint256);

  function allowance(
    address owner,
    address spender
  ) external view returns (uint256);

  function balanceOf(address account) external view returns (uint256);

  // external setters

  function approve(address spender, uint256 value) external returns (bool);

  function transfer(address to, uint256 value) external returns (bool);

  function transferFrom(
    address from,
    address to,
    uint256 value
  ) external returns (bool);
}
