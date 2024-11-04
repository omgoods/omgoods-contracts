// SPDX-License-Identifier: None
pragma solidity 0.8.27;

import {TokenImpl} from "../TokenImpl.sol";

contract TokenImplMock is TokenImpl {
  // deployment

  constructor(string memory eip712Name, address factory) TokenImpl(eip712Name) {
    _setFactory(factory);
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
    bytes32 structHash
  ) external view virtual returns (bytes32) {
    return _hashInitialization(structHash);
  }
}
