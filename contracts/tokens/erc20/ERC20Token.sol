// SPDX-License-Identifier: None
pragma solidity 0.8.21;

import {Context} from "@openzeppelin/contracts/utils/Context.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {GatewayRecipient} from "../../gateway/GatewayRecipient.sol";
import {Token} from "../Token.sol";
import {IERC20TokenEvents} from "./IERC20TokenEvents.sol";

abstract contract ERC20Token is ERC20, Token {
  // deployment

  constructor(address owner) ERC20("", "") Token(owner) {
    //
  }

  // internal getters

  function _msgSender()
    internal
    view
    virtual
    override(Context, GatewayRecipient)
    returns (address)
  {
    return GatewayRecipient._msgSender();
  }

  // internal setters

  function _update(
    address from,
    address to,
    uint256 value
  ) internal override whenUnlocked {
    super._update(from, to, value);

    _tokenRegistry.emitTokenEvent(
      abi.encodeCall(IERC20TokenEvents.Transfer, (from, to, value))
    );
  }

  function _approve(
    address owner,
    address spender,
    uint256 value,
    bool
  ) internal override {
    super._approve(owner, spender, value, true);

    _tokenRegistry.emitTokenEvent(
      abi.encodeCall(IERC20TokenEvents.Approval, (owner, spender, value))
    );
  }
}
