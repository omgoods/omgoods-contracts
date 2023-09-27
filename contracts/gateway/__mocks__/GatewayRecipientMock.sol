// SPDX-License-Identifier: None
pragma solidity 0.8.21;

import {GatewayRecipient} from "../GatewayRecipient.sol";

contract GatewayRecipientMock is GatewayRecipient {
  // events

  event MsgSender(address sender);

  // deployment

  constructor(address gateway) {
    _gateway = gateway;
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
