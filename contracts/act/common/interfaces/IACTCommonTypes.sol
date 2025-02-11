// SPDX-License-Identifier: None
pragma solidity 0.8.28;

import {Epochs} from "../../../common/Epochs.sol";

interface IACTCommonTypes {
  // enums

  enum States {
    Locked, // 0
    Active, // 1
    Tracked // 2
  }

  enum Systems {
    AbsoluteMonarchy, // 0
    ConstitutionalMonarchy, // 1
    Democracy // 2
  }

  // structs

  struct Settings {
    States state;
    Systems system;
    Epochs.Settings epochs;
  }

  struct Extensions {
    mapping(address => bool) enabled;
    mapping(bytes4 => address) selectors;
  }

  struct ModuleAccess {
    bool isMinter;
    bool isBurner;
    bool isOperator;
  }

  struct Modules {
    mapping(address => ModuleAccess) accesses;
  }
}
