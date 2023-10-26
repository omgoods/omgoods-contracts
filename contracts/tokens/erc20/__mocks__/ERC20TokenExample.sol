// SPDX-License-Identifier: None
pragma solidity 0.8.21;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ERC20TokenExample is ERC20 {
  // deployment

  constructor(uint256 totalSupply_) ERC20("Example", "EXAMPLE") {
    _mint(msg.sender, totalSupply_);
  }
}
