// SPDX-License-Identifier: NONE
pragma solidity 0.8.21;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ERC20ExternalTokenMock is ERC20 {
  // storage

  uint8 private _decimals;

  // deployment

  constructor(
    string memory name_,
    string memory symbol_,
    uint8 decimals_,
    uint256 initialSupply
  ) ERC20(name_, symbol_) {
    _decimals = decimals_;

    _mint(_msgSender(), initialSupply);
  }

  // public getters

  function decimals() public view override returns (uint8) {
    return _decimals;
  }

  // external setters

  function mint(address to, uint256 amount) external {
    _mint(to, amount);
  }

  function burn(address from, uint256 amount) external {
    _burn(from, amount);
  }
}
