// SPDX-License-Identifier: None
pragma solidity ^0.8.21;

abstract contract Controlled {
  // storage

  mapping(address => bool) internal _controllers;

  // errors

  error MsgSenderIsNotTheController();

  error ControllerIsTheZeroAddress();

  // modifiers

  modifier onlyController() {
    if (!_controllers[msg.sender]) {
      revert MsgSenderIsNotTheController();
    }

    _;
  }

  // external getters

  function hasController(address controller) external view returns (bool) {
    return _controllers[controller];
  }

  // internal setters

  function _setControllers(address[] calldata controllers) internal {
    uint256 len = controllers.length;

    for (uint256 index; index < len; ) {
      address controller = controllers[index];

      if (controller == address(0)) {
        revert ControllerIsTheZeroAddress();
      }

      if (!_controllers[controller]) {
        _controllers[controller] = true;
      }

      unchecked {
        index += 1;
      }
    }
  }
}
