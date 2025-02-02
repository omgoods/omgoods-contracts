// SPDX-License-Identifier: None
pragma solidity 0.8.28;

import {Epochs} from "../common/Epochs.sol";
import {ACTStates, ACTSystems} from "./enums.sol";

struct ACTSettings {
  ACTStates state;
  ACTSystems system;
  Epochs.Settings epochs;
}

struct ACTExtensions {
  mapping(address => bool) enabled;
  mapping(bytes4 => address) selectors;
}

struct ACTModuleAccess {
  bool isMinter;
  bool isBurner;
  bool isOperator;
}

struct ACTModules {
  mapping(address => ACTModuleAccess) accesses;
}
