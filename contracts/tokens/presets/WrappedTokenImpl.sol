// SPDX-License-Identifier: None
pragma solidity 0.8.24;

import {TokenImpl} from "../TokenImpl.sol";

abstract contract WrappedTokenImpl is TokenImpl {
  // storage

  address internal _underlyingToken;

  // errors

  error UnderlyingTokenIsTheZeroAddress();

  // deployment

  constructor() TokenImpl() {
    //
  }

  function initialize(address forwarder, address underlyingToken) external {
    if (underlyingToken == address(0)) {
      revert UnderlyingTokenIsTheZeroAddress();
    }

    _initialize(forwarder, false);

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
