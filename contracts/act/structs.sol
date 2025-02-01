// SPDX-License-Identifier: None
pragma solidity 0.8.28;

import {Epochs} from "../common/Epochs.sol";

struct ACTSettings {
  uint8 system;
  bool ready;
  Epochs.Settings epochs;
}

struct ACTExtensions {
  mapping(bytes4 => address) enabled;
}

struct ACTModules {
  mapping(bytes4 => address) enabled;
}
