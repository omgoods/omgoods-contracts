// SPDX-License-Identifier: None
pragma solidity 0.8.27;

import {ERC20TokenImpl} from "./ERC20TokenImpl.sol";

contract ERC20TokenRegularImpl is ERC20TokenImpl {
  struct InitializationData {
    address owner;
    address controller;
    string name;
    string symbol;
    uint8 decimals;
    bool ready;
  }

  bytes32 private constant INITIALIZATION_TYPEHASH =
    keccak256(
      "Initialization(address owner,address controller,string name,string symbol,uint8 decimals,bool ready)"
    );

  // deployment

  constructor(string memory eip712Name) ERC20TokenImpl(eip712Name) {
    //
  }

  function initialize(
    address forwarder,
    address owner,
    address controller,
    string calldata name_,
    string calldata symbol_,
    uint8 decimals_,
    bool ready
  ) external onlyFactory {
    _setForwarder(forwarder);
    _setOwner(owner);
    _setController(controller);
    _setName(name_);
    _setSymbol(symbol_);
    _setDecimals(decimals_);
    _setReady(ready);
  }

  // external getters

  function hashInitialization(
    InitializationData calldata initializationData
  ) external view returns (bytes32) {
    return
      _hashInitialization(
        abi.encode(
          INITIALIZATION_TYPEHASH, //
          initializationData.owner,
          initializationData.controller,
          keccak256(abi.encodePacked(initializationData.name)),
          keccak256(abi.encodePacked(initializationData.symbol)),
          initializationData.decimals,
          initializationData.ready
        )
      );
  }

  // external setters

  function mint(address to, uint256 value) external onlyCurrentManager {
    _mint(to, value);
  }

  function burn(address from, uint256 value) external onlyCurrentManager {
    _burn(from, value);
  }
}
