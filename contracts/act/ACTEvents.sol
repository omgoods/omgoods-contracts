// SPDX-License-Identifier: None
pragma solidity 0.8.28;

import {ACTSystems} from "./enums.sol";

/* solhint-disable func-name-mixedcase */

interface ACTEvents {
  // external views

  function NameUpdated(string memory name) external view;

  function RegistryUpdated(address registry) external view;

  function MaintainerUpdated(address maintainer) external view;

  function SystemUpdated(ACTSystems system) external view;

  function BecameReady() external view;
}
