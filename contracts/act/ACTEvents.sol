// SPDX-License-Identifier: None
pragma solidity 0.8.28;

import {ACTStates, ACTSystems} from "./enums.sol";
import {ACTModuleAccess} from "./structs.sol";

/* solhint-disable func-name-mixedcase */

interface ACTEvents {
  // external views

  function NameUpdated(string memory name) external view;

  function MaintainerUpdated(address maintainer) external view;

  function StateUpdated(ACTStates state) external view;

  function SystemUpdated(ACTSystems system) external view;

  function ModuleUpdated(
    address module,
    ACTModuleAccess memory access
  ) external view;
}
