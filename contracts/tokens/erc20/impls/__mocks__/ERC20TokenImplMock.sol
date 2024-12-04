// SPDX-License-Identifier: None
pragma solidity 0.8.27;

import {ERC20TokenImpl} from "../ERC20TokenImpl.sol";

contract ERC20TokenImplMock is ERC20TokenImpl {
  // deployment

  constructor(string memory eip712Name) ERC20TokenImpl(eip712Name) {
    //
  }

  function initialize(
    address owner,
    address controller,
    string calldata name_,
    string calldata symbol_,
    uint8 decimals_
  ) external onlyFactory {
    _setOwner(owner);
    _setController(controller);
    _setName(name_);
    _setSymbol(symbol_);
    _setDecimals(decimals_);
  }

  // external setters

  function mint(address to, uint256 value) external {
    _mint(to, value);
  }
}
