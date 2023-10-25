// SPDX-License-Identifier: None
pragma solidity 0.8.21;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {GatewayRecipient} from "../../../gateway/GatewayRecipient.sol";
import {BasicTokenImpl} from "../../presets/BasicTokenImpl.sol";
import {ERC721Token} from "../ERC721Token.sol";

contract ERC721BasicTokenImpl is ERC721Token, BasicTokenImpl {
  // deployment

  constructor() BasicTokenImpl() {
    //
  }

  // public getters

  function name()
    public
    view
    override(ERC721, BasicTokenImpl)
    returns (string memory)
  {
    return BasicTokenImpl.name();
  }

  function symbol()
    public
    view
    override(ERC721, BasicTokenImpl)
    returns (string memory)
  {
    return BasicTokenImpl.symbol();
  }

  // external setters

  function mint(address to, uint256 tokenId) external onlyController {
    _mint(to, tokenId);
  }

  function burn(uint256 tokenId) external onlyController {
    _burn(tokenId);
  }

  // internal getters

  function _msgSender()
    internal
    view
    virtual
    override(ERC721Token, GatewayRecipient)
    returns (address)
  {
    return GatewayRecipient._msgSender();
  }

  // internal setters

  function _update(
    address to,
    uint256 tokenId,
    address auth
  ) internal override onlyOwnerWhenLocked returns (address) {
    return super._update(to, tokenId, auth);
  }
}
