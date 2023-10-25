// SPDX-License-Identifier: None
pragma solidity 0.8.21;

import {TokenImpl} from "../TokenImpl.sol";

contract WrappedTokenImpl is TokenImpl {
  // storage

  address internal _underlyingToken;

  // deployment

  constructor() TokenImpl() {
    //
  }

  function initialize(address gateway, address underlyingToken) external {
    _initialize(gateway);

    _underlyingToken = underlyingToken;
  }

  // public getters

  function name() public view virtual returns (string memory) {
    return WrappedTokenImpl(_underlyingToken).name();
  }

  function symbol() public view virtual returns (string memory) {
    return WrappedTokenImpl(_underlyingToken).symbol();
  }

  // external getters

  function getUnderlyingToken() external view returns (address) {
    return _underlyingToken;
  }
}
