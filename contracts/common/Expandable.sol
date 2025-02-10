// SPDX-License-Identifier: None
pragma solidity 0.8.28;

import {Address} from "./Address.sol";

abstract contract Expandable {
  using Address for address;

  // errors

  error ExtensionNotFound(bytes4 selector);

  // internal getters

  function _getExtension(
    bytes4 selector
  ) internal view virtual returns (address);

  // internal setters

  function _callExtension(
    bytes memory callData
  ) internal returns (bytes memory) {
    bytes4 selector = abi.decode(callData, (bytes4));

    return _verifyExtension(selector).makeDelegateCall(callData);
  }

  function _callExtension() internal {
    _verifyExtension(msg.sig).makeDelegateCall();
  }

  // private getters

  function _verifyExtension(
    bytes4 selector
  ) private view returns (address result) {
    result = _getExtension(selector);

    require(result != address(0), ExtensionNotFound(selector));

    return result;
  }
}
