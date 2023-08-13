// SPDX-License-Identifier: NONE
pragma solidity 0.8.21;

import {GatewayRecipient} from "../GatewayRecipient.sol";

contract GatewayRecipientMock is GatewayRecipient {
  // events

  event MsgSender(address sender);

  // deployment

  constructor() {
    _gateway = msg.sender;
  }

  // external getters

  function msgSender() external view returns (address) {
    return _msgSender();
  }

  // external setters

  function setGateway(address gateway) external {
    _gateway = gateway;
  }

  function emitMsgSender() external {
    emit MsgSender(_msgSender());
  }
}
