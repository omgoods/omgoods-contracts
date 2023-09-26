// SPDX-License-Identifier: None
pragma solidity 0.8.21;

import {ERC20TokenImpl} from "../ERC20TokenImpl.sol";

contract ERC20TokenImplMock is ERC20TokenImpl {
  // deployment

  constructor(address tokenFactory) ERC20TokenImpl() {
    _tokenFactory = tokenFactory;
  }

  // external setters

  function update(address from, address to, uint256 value) external {
    _update(from, to, value);
  }
}
