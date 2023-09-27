// SPDX-License-Identifier: None
pragma solidity 0.8.21;

import {ERC20TokenImpl} from "../ERC20TokenImpl.sol";

contract ERC20TokenImplMock is ERC20TokenImpl {
  // deployment

  constructor(
    address gateway,
    address tokenFactory,
    string memory name_,
    string memory symbol_
  ) ERC20TokenImpl() {
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

  function update(address from, address to, uint256 value) external {
    _update(from, to, value);
  }
}
