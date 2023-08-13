// SPDX-License-Identifier: NONE
pragma solidity ^0.8.21;

import {Ownable} from "../Ownable.sol";

contract OwnableMock is Ownable {
  // deployment

  constructor(address owner) Ownable(owner) {
    //
  }
}
