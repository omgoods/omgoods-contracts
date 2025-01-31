// SPDX-License-Identifier: None
pragma solidity 0.8.28;

import {ACT} from "../ACT.sol";
import {ACTCore} from "../ACTCore.sol";

contract NonFungibleACT is ACT {
  // external getters

  function kind() external pure override returns (ACTCore.Kinds) {
    return ACTCore.Kinds.NonFungible;
  }
}
