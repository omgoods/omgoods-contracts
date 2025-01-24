// SPDX-License-Identifier: None
pragma solidity 0.8.28;

import {ACT} from "../ACT.sol";

contract ACTMock is ACT {
  constructor() {
    //
  }

  function setName(string calldata name_) external {
    _setName(name_);
  }

  function setSymbol(string calldata symbol_) external {
    _setSymbol(symbol_);
  }
}
