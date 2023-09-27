// SPDX-License-Identifier: None
pragma solidity 0.8.21;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ERC20ExternalTokenMock is ERC20 {
  // deployment

  constructor(
    string memory name_,
    string memory symbol_,
    uint256 initialSupply
  ) ERC20(name_, symbol_) {
    _mint(_msgSender(), initialSupply);
  }

  // external setters

  function mint(address to, uint256 amount) external {
    _mint(to, amount);
  }

  function burn(address from, uint256 amount) external {
    _burn(from, amount);
  }
}
