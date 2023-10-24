// SPDX-License-Identifier: None
pragma solidity 0.8.21;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {GatewayRecipient} from "../../../gateway/GatewayRecipient.sol";
import {BasicTokenImpl} from "../../common/presets/BasicTokenImpl.sol";
import {ERC20Token} from "../ERC20Token.sol";

contract ERC20BasicTokenImpl is ERC20Token, BasicTokenImpl {
  // deployment

  constructor() BasicTokenImpl() {
    //
  }

  // public getters

  function name()
    public
    view
    override(ERC20, BasicTokenImpl)
    returns (string memory)
  {
    return BasicTokenImpl.name();
  }

  function symbol()
    public
    view
    override(ERC20, BasicTokenImpl)
    returns (string memory)
  {
    return BasicTokenImpl.symbol();
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
    override(ERC20Token, GatewayRecipient)
    returns (address)
  {
    return GatewayRecipient._msgSender();
  }
}
