// SPDX-License-Identifier: None
pragma solidity 0.8.28;

import {SlotAccess} from "../utils/SlotAccess.sol";

abstract contract ACTStorage {
  enum Systems {
    Unknown, // 0
    AbsoluteMonarchy, // 1
    ConstitutionalMonarchy, // 2
    Democracy // 3
  }

  // slots

  bytes32 private constant SLOT_REGISTRY =
    keccak256(abi.encodePacked("ACT#registry"));

  bytes32 private constant SLOT_SYSTEM =
    keccak256(abi.encodePacked("ACT#system"));

  bytes32 private constant SLOT_READY =
    keccak256(abi.encodePacked("ACT#ready"));

  bytes32 private constant SLOT_OWNER =
    keccak256(abi.encodePacked("ACT#owner"));

  // internal getters

  function _getRegistry() internal view returns (address) {
    return SlotAccess.getAddress(SLOT_REGISTRY);
  }

  function _getSystem() internal view returns (Systems) {
    return Systems(SlotAccess.getUint256(SLOT_SYSTEM));
  }

  function _isReady() internal view returns (bool) {
    return SlotAccess.getBool(SLOT_READY);
  }

  function _getOwner() internal view returns (address) {
    return SlotAccess.getAddress(SLOT_OWNER);
  }

  // internal setters

  function _setRegistry(address registry) internal {
    SlotAccess.setAddress(SLOT_REGISTRY, registry);
  }

  function _setSystem(Systems system) internal {
    SlotAccess.setUint256(SLOT_SYSTEM, uint256(system));
  }

  function _setAsReady() internal {
    SlotAccess.setBool(SLOT_READY, true);
  }

  function _setOwner(address owner) internal {
    SlotAccess.setAddress(SLOT_OWNER, owner);
  }
}
