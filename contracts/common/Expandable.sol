// SPDX-License-Identifier: None
pragma solidity 0.8.28;

abstract contract Expandable {
  // errors

  error ExtensionNotFound(bytes4 selector);

  // internal getters

  function _getExtension(
    bytes4 selector
  ) internal view virtual returns (address);

  // internal setters

  function _callExtension(
    bytes4 selector,
    bytes memory callData
  ) internal returns (bytes memory) {
    address extension = _verifyExtension(selector);

    assembly {
      let result := delegatecall(
        gas(),
        extension,
        add(callData, 32),
        mload(callData),
        0,
        0
      )

      returndatacopy(0, 0, returndatasize())

      switch result
      case 0 {
        revert(0, returndatasize())
      }
      default {
        return(0, returndatasize())
      }
    }
  }

  function _callExtension(
    bytes memory callData
  ) internal returns (bytes memory) {
    bytes4 selector = abi.decode(callData, (bytes4));

    return _callExtension(selector, callData);
  }

  function _callExtension() internal {
    address extension = _verifyExtension(msg.sig);

    // solhint-disable-next-line no-inline-assembly
    assembly {
      calldatacopy(0, 0, calldatasize())

      let result := delegatecall(gas(), extension, 0, calldatasize(), 0, 0)

      returndatacopy(0, 0, returndatasize())

      switch result
      case 0 {
        revert(0, returndatasize())
      }
      default {
        return(0, returndatasize())
      }
    }
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
