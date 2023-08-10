// SPDX-License-Identifier: NONE
pragma solidity 0.8.20;

abstract contract AccountExtension {
  // internal functions (getters)

  function _hasOwner(address owner) internal view virtual returns (bool);

  // internal functions (setters)

  function _afterTransactionExecuted(
    address sender,
    address to,
    uint256 value,
    bytes memory data
  ) internal virtual;
}
