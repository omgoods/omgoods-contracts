// SPDX-License-Identifier: None
pragma solidity 0.8.27;

import {Context} from "@openzeppelin/contracts/utils/Context.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ForwarderContext} from "../../../metatx/ForwarderContext.sol";
import {TokenImpl} from "../../TokenImpl.sol";

abstract contract ERC721TokenImpl is ERC721, TokenImpl {
  // storage

  string private _name;

  string private _symbol;

  string private _uriPrefix;

  // deployment

  constructor(string memory eip712Name) ERC721("", "") TokenImpl(eip712Name) {
    //
  }

  // public getters

  function name() public view override returns (string memory) {
    return _getName();
  }

  function symbol() public view override returns (string memory) {
    return _getSymbol();
  }

  // public setters

  function approve(
    address to,
    uint256 tokenId
  ) public override onlyReadyOrAnyManager {
    super.approve(to, tokenId);
  }

  function setApprovalForAll(
    address operator,
    bool approved
  ) public override onlyReadyOrAnyManager {
    super.setApprovalForAll(operator, approved);
  }

  function transferFrom(
    address from,
    address to,
    uint256 tokenId
  ) public override onlyReadyOrAnyManager {
    super.transferFrom(from, to, tokenId);
  }

  function safeTransferFrom(
    address from,
    address to,
    uint256 tokenId,
    bytes memory data
  ) public override onlyReadyOrAnyManager {
    super.safeTransferFrom(from, to, tokenId, data);
  }

  // internal getters

  function _getName() internal view returns (string memory) {
    return _name;
  }

  function _getSymbol() internal view returns (string memory) {
    return _symbol;
  }

  function _getUriPrefix() internal view returns (string memory) {
    return _uriPrefix;
  }

  function _baseURI() internal view override returns (string memory) {
    return _getUriPrefix();
  }

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

  function _setName(string memory name_) internal {
    _name = name_;
  }

  function _setSymbol(string memory symbol_) internal {
    _symbol = symbol_;
  }

  function _setUriPrefix(string memory uriPrefix) internal {
    _uriPrefix = uriPrefix;
  }

  function _update(
    address to,
    uint256 tokenId,
    address auth
  ) internal virtual override returns (address from) {
    from = super._update(to, tokenId, auth);

    _afterUpdate(from, to, tokenId);

    return from;
  }

  function _afterUpdate(
    address from,
    address to,
    uint256 tokenId
  ) internal virtual {
    _notifyTokenFactory(0x60, abi.encode(from, to, tokenId));
  }

  function _approve(
    address to,
    uint256 tokenId,
    address auth,
    bool emitEvent
  ) internal override {
    super._approve(to, tokenId, auth, emitEvent);

    _afterApprove(to, tokenId, emitEvent);
  }

  function _afterApprove(
    address to,
    uint256 tokenId,
    bool emitEvent
  ) internal virtual {
    if (emitEvent) {
      _notifyTokenFactory(0x61, abi.encode(_ownerOf(tokenId), to, tokenId));
    }
  }

  function _setApprovalForAll(
    address owner,
    address operator,
    bool approved
  ) internal override {
    super._setApprovalForAll(owner, operator, approved);

    _afterSetApprovalForAll(owner, operator, approved);
  }

  function _afterSetApprovalForAll(
    address owner,
    address operator,
    bool approved
  ) internal virtual {
    _notifyTokenFactory(0x62, abi.encode(owner, operator, approved));
  }
}
