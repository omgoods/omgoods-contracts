// SPDX-License-Identifier: None
pragma solidity 0.8.28;

import {IAccount} from "@account-abstraction/contracts/interfaces/IAccount.sol";
import {IOwnable} from "../../../common/interfaces/IOwnable.sol";

interface IACTCommon is IAccount, IOwnable {
  // external getters

  function name() external view returns (string memory);

  function symbol() external view returns (string memory);

  function totalSupply() external view returns (uint256);

  function balanceOf(address account) external view returns (uint256);
}
