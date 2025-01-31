// SPDX-License-Identifier: None
pragma solidity 0.8.28;

import {ACTCore} from "./ACTCore.sol";

interface ACTEvents {
  function NameUpdated(string memory name) external view;

  function RegistryUpdated(address registry) external view;

  function MaintainerUpdated(address maintainer) external view;

  function SystemUpdated(ACTCore.Systems system) external view;

  function BecameReady() external view;
}
