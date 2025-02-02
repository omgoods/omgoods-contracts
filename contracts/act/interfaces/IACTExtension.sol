// SPDX-License-Identifier: None
pragma solidity 0.8.28;

interface IACTExtension {
  // external getters

  function getSupportedSelectors()
    external
    view
    returns (bytes4[] memory result);
}
