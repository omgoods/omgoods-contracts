// SPDX-License-Identifier: None
pragma solidity 0.8.21;

import {Context} from "@openzeppelin/contracts/utils/Context.sol";

abstract contract GatewayRecipient is Context {
  // storage

  address internal _gateway;

  // external getters

  function getGateway() external view returns (address) {
    return _gateway;
  }

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
