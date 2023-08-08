// SPDX-License-Identifier: NONE
pragma solidity ^0.8.20;

import {Ownable} from "../Ownable.sol";

contract OwnableMock is Ownable {
  // deployment functions

  constructor(address owner) Ownable(owner) {
    //
  }
}
