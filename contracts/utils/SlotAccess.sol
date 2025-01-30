// SPDX-License-Identifier: None
pragma solidity 0.8.28;

/* solhint-disable no-inline-assembly */

library SlotAccess {
  // structs

  struct StringSlot {
    string value;
  }

  // internal getters

  function getAddress(bytes32 slot) internal view returns (address result) {
    assembly ("memory-safe") {
      result := sload(slot)
    }
  }

  function getUint256(bytes32 slot) internal view returns (uint256 result) {
    assembly ("memory-safe") {
      result := sload(slot)
    }
  }

  function getBool(bytes32 slot) internal view returns (bool result) {
    assembly ("memory-safe") {
      result := sload(slot)
    }
  }

  function getBytes32(bytes32 slot) internal view returns (bytes32 result) {
    assembly ("memory-safe") {
      result := sload(slot)
    }
  }

  function getString(bytes32 slot) internal view returns (string memory) {
    return getStringSlot(slot).value;
  }

  // internal setters

  function setAddress(bytes32 slot, address value) internal {
    assembly ("memory-safe") {
      sstore(slot, value)
    }
  }

  function setUint256(bytes32 slot, uint256 value) internal {
    assembly ("memory-safe") {
      sstore(slot, value)
    }
  }

  function setBool(bytes32 slot, bool value) internal {
    assembly ("memory-safe") {
      sstore(slot, value)
    }
  }

  function setBytes32(bytes32 slot, bytes32 value) internal {
    assembly ("memory-safe") {
      sstore(slot, value)
    }
  }

  function setString(bytes32 slot, string memory value) internal {
    getStringSlot(slot).value = value;
  }

  // private getters

  function getStringSlot(
    bytes32 slot
  ) private pure returns (StringSlot storage result) {
    assembly ("memory-safe") {
      result.slot := slot
    }

    return result;
  }
}
