// SPDX-License-Identifier: None
pragma solidity 0.8.27;

import {Clone} from "./Clone.sol";

abstract contract CloneImpl is Clone {
  // errors

  error MsgSenderIsNotTheFactory();

  // modifiers

  modifier onlyFactory() {
    if (msg.sender != _getFactory()) {
      revert MsgSenderIsNotTheFactory();
    }

    _;
  }
  // deployment

  constructor() Clone() {
    //
  }
}
