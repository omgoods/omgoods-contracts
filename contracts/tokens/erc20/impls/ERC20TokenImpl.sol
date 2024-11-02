// SPDX-License-Identifier: None
pragma solidity 0.8.27;

import {Context} from "@openzeppelin/contracts/utils/Context.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ForwarderContext} from "../../../metatx/ForwarderContext.sol";
import {TokenImpl} from "../../TokenImpl.sol";

abstract contract ERC20TokenImpl is ERC20, TokenImpl {
  // deployment

  constructor(string memory eip712Name) ERC20("", "") TokenImpl(eip712Name) {
    //
  }

  // public setters

  function approve(
    address spender,
    uint256 value
  ) public override onlyReadyOrManagement returns (bool) {
    return super.approve(spender, value);
  }

  function transfer(
    address to,
    uint256 value
  ) public override onlyReadyOrManagement returns (bool) {
    return super.transfer(to, value);
  }

  function transferFrom(
    address from,
    address to,
    uint256 value
  ) public override onlyReadyOrManagement returns (bool) {
    return super.transferFrom(from, to, value);
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
