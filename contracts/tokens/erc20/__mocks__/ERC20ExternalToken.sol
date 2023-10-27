// SPDX-License-Identifier: None
pragma solidity 0.8.21;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ERC20ExternalToken is ERC20 {
  // deployment

  constructor(
    string memory name_,
    string memory symbol_,
    uint256 totalSupply_
  ) ERC20(name_, symbol_) {
    _mint(msg.sender, totalSupply_);
  }
}
