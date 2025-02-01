// SPDX-License-Identifier: None
pragma solidity 0.8.28;

abstract contract Delegatable {
  // internal setters

  function _delegate(address target) internal {
    // solhint-disable-next-line no-inline-assembly
    assembly {
      calldatacopy(0, 0, calldatasize())

      let result := delegatecall(gas(), target, 0, calldatasize(), 0, 0)

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

  // TODO: memory > calldata
  function _delegate(address target, bytes memory data) internal {
    // solhint-disable-next-line no-inline-assembly
    assembly {
      let result := delegatecall(
        gas(),
        target,
        add(data, 32),
        mload(data),
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
}
