// SPDX-License-Identifier: None
pragma solidity 0.8.24;

import {Context} from "@openzeppelin/contracts/utils/Context.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ForwarderContext} from "../../metatx/ForwarderContext.sol";
import {Token} from "../Token.sol";

abstract contract ERC20Token is ERC20, Token {
  // deployment

  constructor() ERC20("", "") {
    //
  }

  // internal getters

  function _msgSender()
    internal
    view
    virtual
    override(ForwarderContext, Context)
    returns (address)
  {
    return ForwarderContext._msgSender();
  }

  // internal setters

  function _update(
    address from,
    address to,
    uint256 value
  ) internal virtual override {
    super._update(from, to, value);

    _notifyTokenRegistry(0x50, abi.encode(from, to, value));
  }

  function _approve(
    address owner,
    address spender,
    uint256 value,
    bool
  ) internal override {
    super._approve(owner, spender, value, true);

    _notifyTokenRegistry(0x51, abi.encode(owner, spender, value));
  }
}
