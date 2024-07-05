// SPDX-License-Identifier: None
pragma solidity 0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ForwarderContext} from "../../../metatx/ForwarderContext.sol";
import {DefaultTokenImpl} from "../../presets/DefaultTokenImpl.sol";
import {ERC20Token} from "../ERC20Token.sol";

contract ERC20DefaultTokenImpl is ERC20Token, DefaultTokenImpl {
  // deployment

  constructor() DefaultTokenImpl() {
    //
  }

  // public getters

  function name()
    public
    view
    override(ERC20, DefaultTokenImpl)
    returns (string memory)
  {
    return DefaultTokenImpl.name();
  }

  function symbol()
    public
    view
    override(ERC20, DefaultTokenImpl)
    returns (string memory)
  {
    return DefaultTokenImpl.symbol();
  }

  // external setters

  function mint(address to, uint256 value) external onlyController {
    _mint(to, value);
  }

  function burn(address from, uint256 value) external onlyController {
    _burn(from, value);
  }

  // internal getters

  function _msgSender()
    internal
    view
    virtual
    override(ERC20Token, ForwarderContext)
    returns (address)
  {
    return ForwarderContext._msgSender();
  }

  // internal setters

  function _update(
    address from,
    address to,
    uint256 value
  ) internal override onlyOwnerWhenLocked {
    super._update(from, to, value);
  }
}
