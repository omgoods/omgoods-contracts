// SPDX-License-Identifier: None
pragma solidity 0.8.27;

import {TokenImpl} from "../TokenImpl.sol";

contract TokenImplMock is TokenImpl {
  struct InitializationData {
    address owner;
    address controller;
  }

  bytes32 private constant INITIALIZATION_TYPEHASH =
    keccak256("Initialization(address owner,address controller)");

  // deployment

  constructor(string memory eip712Name) TokenImpl(eip712Name) {
    //
  }

  function initialize(address owner, address controller) external onlyFactory {
    _setOwner(owner);
    _setController(controller);
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
          initializationData.controller
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
