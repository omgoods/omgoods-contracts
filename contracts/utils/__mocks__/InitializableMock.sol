// SPDX-License-Identifier: None
pragma solidity 0.8.24;

import {Initializable} from "../Initializable.sol";

contract InitializableMock is Initializable {
  // events

  event Initialized();

  // external setters

  function initialize() external initializeOnce {
    emit Initialized();
  }
}
