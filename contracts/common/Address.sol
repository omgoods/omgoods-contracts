// SPDX-License-Identifier: None
pragma solidity 0.8.28;

library Address {
  // internal setters

  function makeCall(
    address self,
    uint256 value,
    bytes memory data
  ) internal returns (bytes memory) {
    (bool success, bytes memory result) = self.call{value: value}(data);

    if (!success) {
      // solhint-disable-next-line no-inline-assembly
      assembly {
        revert(add(result, 32), mload(result))
      }
    }

    return result;
  }

  function makeCall(
    address self,
    bytes memory data
  ) internal returns (bytes memory) {
    return makeCall(self, 0, data);
  }

  function makeDelegateCall(
    address self,
    bytes memory data
  ) internal returns (bytes memory) {
    (bool success, bytes memory result) = self.delegatecall(data);

    if (!success) {
      // solhint-disable-next-line no-inline-assembly
      assembly {
        revert(add(result, 32), mload(result))
      }
    }

    return result;
  }

  function makeDelegateCall(address self) internal {
    // solhint-disable-next-line no-inline-assembly
    assembly {
      calldatacopy(0, 0, calldatasize())

      let result := delegatecall(gas(), self, 0, calldatasize(), 0, 0)

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

  function makeRefundCall(address self, uint256 value) internal {
    if (value != 0) {
      (bool success, ) = self.call{value: value, gas: type(uint256).max}("");

      (success);
    }
  }
}
