// SPDX-License-Identifier: None
pragma solidity 0.8.21;

import {TokenImpl} from "../TokenImpl.sol";

contract TokenImplMock is TokenImpl {
  // deployment

  function initialize(
    address gateway,
    string calldata name_,
    string calldata symbol_,
    address owner
  ) external {
    _initialize(gateway, name_, symbol_, owner);
  }
}
