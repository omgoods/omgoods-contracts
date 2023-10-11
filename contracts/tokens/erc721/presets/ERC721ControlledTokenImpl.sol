// SPDX-License-Identifier: None
pragma solidity 0.8.21;

import {Controlled} from "../../../access/Controlled.sol";
import {ERC721TokenImpl} from "../ERC721TokenImpl.sol";

contract ERC721ControlledTokenImpl is Controlled, ERC721TokenImpl {
  // deployment

  constructor() ERC721TokenImpl() {
    //
  }

  function initialize(
    address gateway,
    string calldata name_,
    string calldata symbol_,
    address[] calldata controllers
  ) external {
    _initialize(gateway, name_, symbol_);

    _setControllers(controllers);
  }

  // external setters

  function mint(address to, uint256 tokenId) external onlyController {
    _mint(to, tokenId);
  }

  function burn(uint256 tokenId) external onlyController {
    _burn(tokenId);
  }
}
