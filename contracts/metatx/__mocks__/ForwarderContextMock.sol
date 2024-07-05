// SPDX-License-Identifier: None
pragma solidity 0.8.24;

import {ForwarderContext} from "../ForwarderContext.sol";

contract ForwarderContextMock is ForwarderContext {
  // events

  event MsgSender(address sender);

  // deployment

  constructor(address forwarder) {
    _forwarder = forwarder;
  }

  // external getters

  function msgSender() external view returns (address) {
    return _msgSender();
  }

  // external setters

  function emitMsgSender() external {
    emit MsgSender(_msgSender());
  }
}
