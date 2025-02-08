// SPDX-License-Identifier: None
pragma solidity 0.8.28;

import {IAccount} from "@account-abstraction/contracts/interfaces/IAccount.sol";
import {IOwnable} from "../../../common/interfaces/IOwnable.sol";
import {ACTStates, ACTSystems} from "../../core/enums.sol";
import {ACTSettings, ACTModuleAccess} from "../../core/structs.sol";

interface IACTCommon is IAccount, IOwnable {
  // external getters

  function name() external view returns (string memory);

  function symbol() external view returns (string memory);

  function totalSupply() external view returns (uint256);

  function balanceOf(address account) external view returns (uint256);

  function getNonce() external view returns (uint256);

  function getNonce(address account) external view returns (uint256);

  function getRegistry() external view returns (address);

  function getEntryPoint() external view returns (address);

  function getMaintainer() external view returns (address);

  function getSettings() external pure returns (ACTSettings memory);

  function getTotalSupplyAt(uint48 epoch) external view returns (uint256);

  function getBalanceAt(
    uint48 epoch,
    address account
  ) external view returns (uint256);

  function getCurrentEpoch() external view returns (uint48);

  // external setters

  function setName(string calldata name_) external returns (bool);

  function setMaintainer(address maintainer) external returns (bool);

  function setState(ACTStates state) external returns (bool);

  function setSystem(ACTSystems system) external returns (bool);

  function setExtension(
    address extension,
    bool enabled
  ) external returns (bool);

  function setModule(
    address module,
    ACTModuleAccess memory access
  ) external returns (bool);
}
