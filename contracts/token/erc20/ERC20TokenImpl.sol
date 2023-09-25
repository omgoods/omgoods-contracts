// SPDX-License-Identifier: None
pragma solidity 0.8.21;

import {Context} from "@openzeppelin/contracts/utils/Context.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {GatewayRecipient} from "../../gateway/GatewayRecipient.sol";
import {TokenImpl} from "../TokenImpl.sol";
import {ERC20TokenFactory} from "./ERC20TokenFactory.sol";

contract ERC20TokenImpl is ERC20, TokenImpl {
  // storage

  // deployment

  constructor() ERC20("", "") TokenImpl() {
    //
  }

  // public getters

  function name()
    public
    view
    virtual
    override(TokenImpl, ERC20)
    returns (string memory)
  {
    return TokenImpl.name();
  }

  function symbol()
    public
    view
    virtual
    override(TokenImpl, ERC20)
    returns (string memory)
  {
    return TokenImpl.symbol();
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

  function _update(address from, address to, uint256 value) internal override {
    super._update(from, to, value);

    ERC20TokenFactory(_tokenFactory).emitTokenTransfer(from, to, value);
  }

  function _approve(
    address owner,
    address spender,
    uint256 value,
    bool
  ) internal override {
    super._approve(owner, spender, value, true);

    ERC20TokenFactory(_tokenFactory).emitTokenApproval(owner, spender, value);
  }
}
