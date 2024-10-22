// SPDX-License-Identifier: None
pragma solidity 0.8.27;

import {TokenImpl} from "../TokenImpl.sol";

abstract contract TokenWrappedImpl is TokenImpl {
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
    return TokenWrappedImpl(_underlyingToken).name();
  }

  function symbol() public view virtual returns (string memory) {
    return TokenWrappedImpl(_underlyingToken).symbol();
  }

  // external getters

  function getUnderlyingToken() external view returns (address) {
    return _underlyingToken;
  }
}
