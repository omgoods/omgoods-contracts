// SPDX-License-Identifier: None
pragma solidity 0.8.21;

import {Context} from "@openzeppelin/contracts/utils/Context.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {GatewayRecipient} from "../../gateway/GatewayRecipient.sol";
import {TokenImpl} from "../TokenImpl.sol";
import {ERC721TokenFactory} from "./ERC721TokenFactory.sol";

contract ERC721TokenImpl is ERC721, TokenImpl {
  // deployment

  constructor() ERC721("", "") TokenImpl() {
    //
  }

  // public getters

  function name()
    public
    view
    virtual
    override(TokenImpl, ERC721)
    returns (string memory)
  {
    return TokenImpl.name();
  }

  function symbol()
    public
    view
    virtual
    override(TokenImpl, ERC721)
    returns (string memory)
  {
    return TokenImpl.symbol();
  }

  function tokenURI(
    uint256 tokenId
  ) public view override returns (string memory) {
    _requireOwned(tokenId);

    return
      ERC721TokenFactory(_tokenFactory).computeTokenUrl(address(this), tokenId);
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
    address to,
    uint256 tokenId,
    address auth
  ) internal override returns (address from) {
    from = super._update(to, tokenId, auth);

    ERC721TokenFactory(_tokenFactory).emitTokenTransfer(from, to, tokenId);

    return from;
  }

  function _approve(
    address to,
    uint256 tokenId,
    address auth,
    bool emitEvent
  ) internal override {
    super._approve(to, tokenId, auth, emitEvent);

    ERC721TokenFactory(_tokenFactory).emitTokenApproval(
      _ownerOf(tokenId),
      to,
      tokenId
    );
  }

  function _setApprovalForAll(
    address owner,
    address operator,
    bool approved
  ) internal override {
    super._setApprovalForAll(owner, operator, approved);

    ERC721TokenFactory(_tokenFactory).emitTokenApprovalForAll(
      owner,
      operator,
      approved
    );
  }
}
