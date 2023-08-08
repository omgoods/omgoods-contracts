// SPDX-License-Identifier: NONE
pragma solidity 0.8.20;

import {Initializable} from "../Initializable.sol";

contract InitializableMock is Initializable {
  // events

  event Initialized();

  // external functions (setters)

  function initialize() external initializeOnce {
    emit Initialized();
  }
}
