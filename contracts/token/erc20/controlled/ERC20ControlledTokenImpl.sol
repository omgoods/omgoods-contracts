// SPDX-License-Identifier: None
pragma solidity 0.8.21;

import {ProxyImpl} from "../../../common/proxy/ProxyImpl.sol";
import {ERC20Token} from "../ERC20Token.sol";

contract ERC20ControlledTokenImpl is ProxyImpl, ERC20Token {
  // storage

  address private _minter;

  address private _burner;

  // errors

  error MsgSenderIsNotTheTokenMinter();

  error MsgSenderIsNotTheTokenBurner();

  // modifiers

  modifier onlyMinter() {
    if (_msgSender() != _minter) {
      revert MsgSenderIsNotTheTokenMinter();
    }

    _;
  }

  modifier onlyBurner() {
    if (_msgSender() != _burner) {
      revert MsgSenderIsNotTheTokenBurner();
    }

    _;
  }

  // deployment

  constructor() ERC20Token(address(0)) {
    _initialized = true; // singleton
  }

  function initialize(
    address gateway,
    address tokenRegistry,
    string calldata name_,
    string calldata symbol_,
    address owner,
    address minter,
    address burner,
    uint256 initialSupply_
  ) external {
    _initialize(gateway, tokenRegistry, name_, symbol_);

    _owner = owner;
    _minter = minter;
    _burner = burner;

    _mint(owner, initialSupply_);
  }

  // external getters

  function getControllers()
    external
    view
    returns (address minter, address burner)
  {
    return (_minter, _burner);
  }

  // external setters

  function mint(address to, uint256 amount) external onlyMinter {
    _mint(to, amount);
  }

  function burn(address from, uint256 amount) external onlyBurner {
    _burn(from, amount);
  }
}
