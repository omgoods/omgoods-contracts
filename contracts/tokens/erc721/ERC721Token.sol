// SPDX-License-Identifier: None
pragma solidity 0.8.27;

import {Context} from "@openzeppelin/contracts/utils/Context.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ForwarderContext} from "../../metatx/ForwarderContext.sol";
import {Token} from "../Token.sol";

abstract contract ERC721Token is ERC721, Token {
  // deployment

  constructor() ERC721("", "") {
    //
  }

  // internal getters

  function _msgSender()
    internal
    view
    virtual
    override(Context, ForwarderContext)
    returns (address)
  {
    return ForwarderContext._msgSender();
  }

  // internal setters

  function _update(
    address to,
    uint256 tokenId,
    address auth
  ) internal virtual override returns (address from) {
    from = super._update(to, tokenId, auth);

    _notifyTokenRegistry(0x60, abi.encode(from, to, tokenId));

    return from;
  }

  function _approve(
    address to,
    uint256 tokenId,
    address auth,
    bool emitEvent
  ) internal override {
    super._approve(to, tokenId, auth, emitEvent);

    if (emitEvent) {
      _notifyTokenRegistry(0x61, abi.encode(_ownerOf(tokenId), to, tokenId));
    }
  }

  function _setApprovalForAll(
    address owner,
    address operator,
    bool approved
  ) internal override {
    super._setApprovalForAll(owner, operator, approved);

    _notifyTokenRegistry(0x62, abi.encode(owner, operator, approved));
  }
}
