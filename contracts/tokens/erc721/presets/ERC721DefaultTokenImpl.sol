// SPDX-License-Identifier: None
pragma solidity 0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ForwarderContext} from "../../../metatx/ForwarderContext.sol";
import {DefaultTokenImpl} from "../../presets/DefaultTokenImpl.sol";
import {ERC721Token} from "../ERC721Token.sol";

contract ERC721DefaultTokenImpl is ERC721Token, DefaultTokenImpl {
  // deployment

  constructor() DefaultTokenImpl() {
    //
  }

  // public getters

  function name()
    public
    view
    override(ERC721, DefaultTokenImpl)
    returns (string memory)
  {
    return DefaultTokenImpl.name();
  }

  function symbol()
    public
    view
    override(ERC721, DefaultTokenImpl)
    returns (string memory)
  {
    return DefaultTokenImpl.symbol();
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
    override(ERC721Token, ForwarderContext)
    returns (address)
  {
    return ForwarderContext._msgSender();
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
