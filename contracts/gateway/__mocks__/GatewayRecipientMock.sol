// SPDX-License-Identifier: NONE
pragma solidity 0.8.21;

import {GatewayRecipient} from "../GatewayRecipient.sol";

contract GatewayRecipientMock is GatewayRecipient {
  // events

  event MsgSender(address sender);

  // deployment

  constructor(address gateway) {
    _gateway = gateway;
  }

  // external setters

  function emitMsgSender() external {
    emit MsgSender(_msgSender());
  }
}
