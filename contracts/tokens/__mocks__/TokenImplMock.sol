// SPDX-License-Identifier: None
pragma solidity 0.8.27;

import {TokenImpl} from "../TokenImpl.sol";

contract TokenImplMock is TokenImpl {
  struct InitializationData {
    address owner;
    address controller;
    bool ready;
  }

  bytes32 private constant INITIALIZATION_TYPEHASH =
    keccak256("Initialization(address owner,address controller,bool ready)");

  // deployment

  constructor(string memory eip712Name) TokenImpl(eip712Name) {
    //
  }

  function initialize(
    address owner,
    address controller,
    bool ready
  ) external onlyFactory {
    _setOwner(owner);
    _setController(controller);
    _setReady(ready);
  }

  // external getters

  function hashInitialization(
    InitializationData calldata initializationData
  ) external view returns (bytes32) {
    return
      _hashInitialization(
        keccak256(
          abi.encode(
            INITIALIZATION_TYPEHASH, //
            initializationData.owner,
            initializationData.controller,
            initializationData.ready
          )
        )
      );
  }

  function requireOnlyCurrentManager()
    external
    view
    onlyCurrentManager
    returns (bool)
  {
    return true;
  }

  function requireOnlyReadyOrAnyManager()
    external
    view
    onlyReadyOrAnyManager
    returns (bool)
  {
    return true;
  }
}
