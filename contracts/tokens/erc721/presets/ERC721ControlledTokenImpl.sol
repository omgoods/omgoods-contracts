// SPDX-License-Identifier: None
pragma solidity 0.8.21;

import {ERC721TokenImpl} from "../ERC721TokenImpl.sol";

contract ERC721ControlledTokenImpl is ERC721TokenImpl {
  // storage

  address private _controller;

  // errors

  error MsgSenderIsNotTheController();

  // modifiers

  modifier onlyController() {
    if (_msgSender() != _controller) {
      revert MsgSenderIsNotTheController();
    }

    _;
  }

  // deployment

  constructor() ERC721TokenImpl() {
    //
  }

  function initialize(
    address gateway,
    string calldata name_,
    string calldata symbol_,
    address controller
  ) external {
    _initialize(gateway, name_, symbol_);

    _controller = controller;
  }

  // external getters

  function getController() external view returns (address) {
    return _controller;
  }

  // external setters

  function mint(address to, uint256 tokenId) external onlyController {
    _mint(to, tokenId);
  }

  function burn(uint256 tokenId) external onlyController {
    _burn(tokenId);
  }
}
