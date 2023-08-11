// SPDX-License-Identifier: NONE
pragma solidity 0.8.20;

import {Context} from "@openzeppelin/contracts/utils/Context.sol";

abstract contract GatewayRecipient is Context {
  // storage

  address internal _gateway;

  // internal getters

  function _msgSender()
    internal
    view
    virtual
    override
    returns (address sender)
  {
    if (msg.sender == _gateway) {
      // solhint-disable-next-line no-inline-assembly
      assembly {
        sender := shr(96, calldataload(sub(calldatasize(), 20)))
      }
    } else {
      sender = super._msgSender();
    }

    return sender;
  }
}
