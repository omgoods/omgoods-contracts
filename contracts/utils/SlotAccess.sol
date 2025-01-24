// SPDX-License-Identifier: None
pragma solidity 0.8.28;

/* solhint-disable no-inline-assembly */

library SlotAccess {
  struct BytesSlot {
    bytes value;
  }

  struct StringSlot {
    string value;
  }

  // internal getters

  function getAddress(bytes32 slot) internal view returns (address) {
    assembly ("memory-safe") {
      mstore(0x00, sload(slot))
      return(0x00, 0x20)
    }
  }

  function getUint256(bytes32 slot) internal view returns (uint256) {
    assembly ("memory-safe") {
      mstore(0x00, sload(slot))
      return(0x00, 0x20)
    }
  }

  function getBool(bytes32 slot) internal view returns (bool) {
    assembly ("memory-safe") {
      mstore(0x00, sload(slot))
      return(0x00, 0x20)
    }
  }

  function getBytes32(bytes32 slot) internal view returns (bytes32) {
    assembly ("memory-safe") {
      mstore(0x00, sload(slot))
      return(0x00, 0x20)
    }
  }

  function getBytes(bytes32 slot) internal view returns (bytes memory) {
    return getBytesSlot(slot).value;
  }

  function getBytesSlot(
    bytes32 slot
  ) internal view returns (BytesSlot storage result) {
    assembly ("memory-safe") {
      result.slot := slot
    }
    return result;
  }

  function getString(bytes32 slot) internal view returns (string memory) {
    return getStringSlot(slot).value;
  }

  function getStringSlot(
    bytes32 slot
  ) internal view returns (StringSlot storage result) {
    assembly ("memory-safe") {
      result.slot := slot
    }
    return result;
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

  function setBytes(bytes32 slot, bytes memory value) internal {
    getBytesSlot(slot).value = value;
  }
}
