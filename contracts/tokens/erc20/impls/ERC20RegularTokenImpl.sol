// SPDX-License-Identifier: None
pragma solidity 0.8.27;

import {ERC20TokenImpl} from "./ERC20TokenImpl.sol";

contract ERC20RegularTokenImpl is ERC20TokenImpl {
  struct InitializationData {
    address forwarder;
    bool ready;
    address owner;
    address controller;
    string name;
    string symbol;
  }

  bytes32 private constant INITIALIZATION_TYPEHASH =
    keccak256(
      "Initialization(address forwarder,bool ready,address owner,address controller,string name,string symbol)"
    );

  // storage

  string private _name;

  string private _symbol;

  // deployment

  constructor(string memory eip712Name) ERC20TokenImpl(eip712Name) {
    //
  }

  function initialize(
    address forwarder,
    bool ready,
    address owner,
    address controller,
    string calldata name_,
    string calldata symbol_
  ) external {
    _setForwarder(forwarder);
    _setReady(ready, false);
    _setOwner(owner, false);
    _setController(controller);

    _name = name_;
    _symbol = symbol_;
  }

  // public getters

  function name() public view override returns (string memory) {
    return _name;
  }

  function symbol() public view override returns (string memory) {
    return _symbol;
  }

  // external getters

  function hashInitialization(
    InitializationData calldata initializationData
  ) private view returns (bytes32) {
    return
      _hashTypedDataV4(
        keccak256(
          abi.encode(
            INITIALIZATION_TYPEHASH, //
            initializationData.forwarder,
            initializationData.ready,
            initializationData.owner,
            initializationData.controller,
            keccak256(abi.encodePacked(initializationData.name)),
            keccak256(abi.encodePacked(initializationData.symbol))
          )
        )
      );
  }

  // external setters

  function mint(address to, uint256 value) external onlyManagement {
    _mint(to, value);
  }

  function burn(address from, uint256 value) external onlyManagement {
    _burn(from, value);
  }
}
