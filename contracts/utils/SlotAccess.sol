// SPDX-License-Identifier: None
pragma solidity 0.8.28;

library SlotAccess {
  // internal getters

  function getAddress(bytes32 slot) internal view returns (address) {
    assembly {
      let value := sload(slot)
      mstore(0x00, value)
      return(0x00, 0x20)
    }
  }

  function getBool(bytes32 slot) internal view returns (bool) {
    assembly {
      let value := sload(slot)
      mstore(0x00, value)
      return(0x00, 0x20)
    }
  }

  function getUint256(bytes32 slot) internal view returns (uint256) {
    assembly {
      let value := sload(slot)
      mstore(0x00, value)
      return(0x00, 0x20)
    }
  }

  // internal setters

  function setAddress(bytes32 slot, address value) internal {
    assembly {
      sstore(slot, value)
    }
  }

  function setBool(bytes32 slot, bool value) internal {
    assembly {
      sstore(slot, value)
    }
  }

  function setUint256(bytes32 slot, uint256 value) internal {
    assembly {
      sstore(slot, value)
    }
  }
}
