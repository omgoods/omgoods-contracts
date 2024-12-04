// SPDX-License-Identifier: None
pragma solidity 0.8.27;

import {ERC721TokenImpl} from "./ERC721TokenImpl.sol";

contract ERC721TokenRegularImpl is ERC721TokenImpl {
  struct InitializationData {
    address owner;
    address controller;
    string name;
    string symbol;
    bool ready;
  }

  bytes32 private constant INITIALIZATION_TYPEHASH =
    keccak256(
      "Initialization(address owner,address controller,string name,string symbol,bool ready)"
    );

  // deployment

  constructor(string memory eip712Name) ERC721TokenImpl(eip712Name) {
    //
  }

  function initialize(
    address forwarder,
    address owner,
    address controller,
    string calldata name_,
    string calldata symbol_,
    string calldata uriPrefix,
    bool ready
  ) external onlyFactory {
    _setForwarder(forwarder);
    _setOwner(owner);
    _setController(controller);
    _setName(name_);
    _setSymbol(symbol_);
    _setUriPrefix(uriPrefix);
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
          initializationData.ready
        )
      );
  }

  // external setters

  function mint(address to, uint256 tokenId) external onlyCurrentManager {
    _mint(to, tokenId);
  }

  function burn(uint256 tokenId) external onlyCurrentManager {
    _burn(tokenId);
  }
}
