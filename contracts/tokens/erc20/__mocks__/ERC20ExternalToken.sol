// SPDX-License-Identifier: None
pragma solidity 0.8.27;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ERC20ExternalToken is ERC20 {
  // storage

  uint8 private immutable _DECIMALS;

  // deployment

  constructor(
    string memory name_,
    string memory symbol_,
    uint8 decimals_,
    uint256 totalSupply_
  ) ERC20(name_, symbol_) {
    _DECIMALS = decimals_;

    _mint(msg.sender, totalSupply_);
  }

  function decimals() public view override returns (uint8) {
    return _DECIMALS;
  }
}
