// SPDX-License-Identifier: None
pragma solidity 0.8.24;

import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ForwarderContext} from "../../../metatx/ForwarderContext.sol";
import {WrappedTokenImpl} from "../../presets/WrappedTokenImpl.sol";
import {ERC20Token} from "../ERC20Token.sol";

contract ERC20WrappedTokenImpl is ERC20Token, WrappedTokenImpl {
  using SafeERC20 for ERC20;

  // deployment

  constructor() WrappedTokenImpl() {
    //
  }

  // public getters

  function name()
    public
    view
    override(ERC20, WrappedTokenImpl)
    returns (string memory)
  {
    return WrappedTokenImpl.name();
  }

  function symbol()
    public
    view
    override(ERC20, WrappedTokenImpl)
    returns (string memory)
  {
    return WrappedTokenImpl.symbol();
  }

  function decimals() public view override returns (uint8) {
    return ERC20Token(_underlyingToken).decimals();
  }

  // external setters

  function deposit(uint256 value) external {
    address msgSender = _msgSender();

    _deposit(msgSender, msgSender, value);
  }

  function depositTo(address to, uint256 value) external {
    _deposit(_msgSender(), to, value);
  }

  function withdraw(uint256 value) external {
    address msgSender = _msgSender();

    _withdraw(msgSender, msgSender, value);
  }

  function withdrawTo(address to, uint256 value) external {
    _withdraw(_msgSender(), to, value);
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

  // private setters

  function _deposit(address from, address to, uint256 value) private {
    ERC20(_underlyingToken).safeTransferFrom(from, address(this), value);

    _mint(to, value);
  }

  function _withdraw(address from, address to, uint256 value) private {
    _burn(from, value);

    ERC20(_underlyingToken).safeTransfer(to, value);
  }
}
