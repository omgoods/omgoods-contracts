// SPDX-License-Identifier: None
pragma solidity 0.8.27;

import {ERC721TokenImpl} from "../ERC721TokenImpl.sol";

contract ERC721TokenImplMock is ERC721TokenImpl {
  // deployment

  constructor(string memory eip712Name) ERC721TokenImpl(eip712Name) {
    //
  }

  function initialize(
    address owner,
    address controller,
    string calldata name_,
    string calldata symbol_,
    string calldata uriPrefix
  ) external onlyFactory {
    _setOwner(owner);
    _setController(controller);
    _setName(name_);
    _setSymbol(symbol_);
    _setUriPrefix(uriPrefix);
  }

  // external setters

  function mint(address to, uint256 tokenId) external {
    _mint(to, tokenId);
  }
}
