// SPDX-License-Identifier: None
pragma solidity 0.8.28;

import {ACT} from "../ACT.sol";
import {ACTKinds} from "../enums/ACTKinds.sol";

contract NonFungibleACT is ACT {
  // external getters

  function kind() external pure override returns (ACTKinds) {
    return ACTKinds.NonFungible;
  }
}
