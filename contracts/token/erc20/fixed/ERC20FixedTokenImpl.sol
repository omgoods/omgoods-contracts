// SPDX-License-Identifier: None
pragma solidity 0.8.21;

import {ERC20TokenImpl} from "../ERC20TokenImpl.sol";

contract ERC20FixedTokenImpl is ERC20TokenImpl {
  // deployment

  function initialize(
    address gateway,
    string calldata name_,
    string calldata symbol_,
    address owner,
    uint256 totalSupply_
  ) external {
    _initialize(gateway, name_, symbol_, owner);

    _update(address(0), owner, totalSupply_);
  }
}
