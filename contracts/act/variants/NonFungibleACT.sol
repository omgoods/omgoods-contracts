// SPDX-License-Identifier: None
pragma solidity 0.8.28;

import {ACT} from "../ACT.sol";
import {ACTVariants} from "../enums.sol";

contract NonFungibleACT is ACT {
  // external getters

  function variant() external pure override returns (ACTVariants) {
    return ACTVariants.NonFungible;
  }
}
