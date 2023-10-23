// SPDX-License-Identifier: None
pragma solidity 0.8.21;

import {TokenFactory} from "../../TokenFactory.sol";
import {ERC20DefaultTokenImpl} from "./ERC20DefaultTokenImpl.sol";

contract ERC20DefaultTokenFactory is TokenFactory {
  // deployment

  constructor(address owner) TokenFactory(owner) {
    //
  }

  // external getters

  function computeToken(
    string calldata symbol
  ) external view returns (address) {
    return _computeToken(keccak256(abi.encodePacked(symbol)));
  }

  // external setters

  function createToken(
    string calldata name,
    string calldata symbol,
    address owner_,
    address[] calldata controllers,
    bool locked,
    uint256 initialSupply,
    bytes calldata guardianSignature
  ) external {
    _createToken(
      keccak256(abi.encodePacked(symbol)),
      abi.encodeCall(
        ERC20DefaultTokenImpl.initialize,
        (_gateway, name, symbol, owner_, controllers, locked, initialSupply)
      ),
      guardianSignature
    );
  }
}
