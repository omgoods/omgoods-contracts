// SPDX-License-Identifier: None
pragma solidity 0.8.21;

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

  function initialize(address gateway, address underlyingToken) external {
    if (underlyingToken == address(0)) {
      revert UnderlyingTokenIsTheZeroAddress();
    }

    _initialize(gateway, false);

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
