// SPDX-License-Identifier: None
pragma solidity 0.8.21;

import {Controlled} from "../../../access/Controlled.sol";
import {ERC20TokenImpl} from "../ERC20TokenImpl.sol";

contract ERC20ControlledTokenImpl is Controlled, ERC20TokenImpl {
  // deployment

  constructor() ERC20TokenImpl() {
    //
  }

  function initialize(
    address gateway,
    string calldata name_,
    string calldata symbol_,
    address[] calldata controllers
  ) external {
    _initialize(gateway, name_, symbol_);

    _setControllers(controllers);
  }

  // external setters

  function mint(address to, uint256 value) external onlyController {
    _mint(to, value);
  }

  function burn(address from, uint256 value) external onlyController {
    _burn(from, value);
  }
}
