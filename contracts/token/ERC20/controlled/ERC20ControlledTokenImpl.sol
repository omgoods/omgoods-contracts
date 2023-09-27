// SPDX-License-Identifier: None
pragma solidity 0.8.21;

import {ERC20TokenImpl} from "../ERC20TokenImpl.sol";

contract ERC20ControlledTokenImpl is ERC20TokenImpl {
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

  constructor() ERC20TokenImpl() {
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

  function mint(address to, uint256 amount) external onlyController {
    _mint(to, amount);
  }

  function burn(address from, uint256 amount) external onlyController {
    _burn(from, amount);
  }
}
