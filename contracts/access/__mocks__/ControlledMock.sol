// SPDX-License-Identifier: None
pragma solidity ^0.8.21;

import {Controlled} from "../Controlled.sol";

contract ControlledMock is Controlled {
  // deployment

  constructor() {
    _controllers[msg.sender] = true;
  }

  // external setters

  function setControllers(address[] calldata controllers) external {
    _setControllers(controllers);
  }
}
