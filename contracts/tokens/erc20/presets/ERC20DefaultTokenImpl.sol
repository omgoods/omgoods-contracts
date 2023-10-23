// SPDX-License-Identifier: None
pragma solidity 0.8.21;

import {Controlled} from "../../../access/Controlled.sol";
import {ERC20Token} from "../ERC20Token.sol";

contract ERC20DefaultTokenImpl is Controlled, ERC20Token {
  // storage

  string private _name;

  string private _symbol;

  string private _settings;

  // deployment

  constructor() ERC20Token(address(0)) {
    _initialized = true;
  }

  function initialize(
    address gateway,
    string calldata name_,
    string calldata symbol_,
    address owner,
    address[] calldata controllers,
    bool locked,
    uint256 initialSupply
  ) external {
    _initialize(gateway);

    _name = name_;

    _symbol = symbol_;

    _setOwner(owner);

    _setControllers(controllers);

    _locked = locked;

    if (initialSupply == 0) {
      _mint(owner, initialSupply);
    }
  }

  // public getters

  function name() public view override returns (string memory) {
    return _name;
  }

  function symbol() public view override returns (string memory) {
    return _symbol;
  }

  // external setters

  function mint(address to, uint256 value) external onlyController {
    _mint(to, value);
  }

  function burn(address from, uint256 value) external onlyController {
    _burn(from, value);
  }
}
