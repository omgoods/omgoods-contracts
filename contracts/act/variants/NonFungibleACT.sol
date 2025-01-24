// SPDX-License-Identifier: None
pragma solidity 0.8.28;

import {ACT} from "../ACT.sol";

contract NonFungibleACT is ACT {
  // external getters

  function kind() external pure override returns (Kinds) {
    return Kinds.NonFungible;
  }
}
