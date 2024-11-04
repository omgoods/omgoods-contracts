// SPDX-License-Identifier: None
pragma solidity 0.8.27;

import {Clone} from "./Clone.sol";

abstract contract CloneImpl is Clone {
  // errors

  error MsgSenderIsNotTheFactory();

  // modifiers

  modifier onlyFactory() {
    _requireOnlyFactory();

    _;
  }

  // deployment

  constructor() Clone() {
    //
  }

  // internal getters

  function _requireOnlyFactory() internal view {
    require(msg.sender == _getFactory(), MsgSenderIsNotTheFactory());
  }
}
