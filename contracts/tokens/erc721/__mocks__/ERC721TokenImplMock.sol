// SPDX-License-Identifier: None
pragma solidity 0.8.21;

import {ERC721TokenImpl} from "../ERC721TokenImpl.sol";

contract ERC721TokenImplMock is ERC721TokenImpl {
  // deployment

  constructor(
    address gateway,
    address tokenFactory,
    string memory name_,
    string memory symbol_
  ) ERC721TokenImpl() {
    _gateway = gateway;

    _tokenFactory = tokenFactory;

    _name = name_;

    _symbol = symbol_;
  }

  // external getters

  function msgSender() external view returns (address) {
    return _msgSender();
  }

  // external setters

  function mint(address to, uint256 tokenId) external {
    _mint(to, tokenId);
  }

  function update(
    address to,
    uint256 tokenId,
    address auth
  ) external returns (address) {
    return _update(to, tokenId, auth);
  }
}
