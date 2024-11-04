// SPDX-License-Identifier: None
pragma solidity 0.8.27;

import {Clone} from "./Clone.sol";

contract CloneTarget is Clone {
  // deployment

  constructor() Clone() {
    //
  }

  function initialize(
    address impl,
    bytes calldata initData
  ) external initializeOnce {
    _setFactory(msg.sender);
    _setImpl(impl);

    _delegate(impl, initData);
  }

  // fallbacks

  receive() external payable {
    _delegate(_getImpl());
  }

  fallback() external payable {
    _delegate(_getImpl());
  }

  // internal setters

  function _delegate(address impl) internal {
    assembly {
      calldatacopy(0, 0, calldatasize())

      let result := delegatecall(gas(), impl, 0, calldatasize(), 0, 0)

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

  function _delegate(address impl, bytes memory data) internal {
    assembly {
      let result := delegatecall(gas(), impl, add(data, 32), mload(data), 0, 0)

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
