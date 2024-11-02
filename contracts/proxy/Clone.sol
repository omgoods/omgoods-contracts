// SPDX-License-Identifier: None
pragma solidity 0.8.27;

import {StorageSlot} from "@openzeppelin/contracts/utils/StorageSlot.sol";
import {Initializable} from "../utils/Initializable.sol";

abstract contract Clone is Initializable {
  bytes32 private constant FACTORY_SLOT =
    keccak256(abi.encodePacked("Clone#factory"));

  bytes32 private constant IMPL_SLOT =
    keccak256(abi.encodePacked("Clone#impl"));

  // deployment

  constructor() {
    _setInitialized();
  }

  // external getters

  function getFactory() external view returns (address) {
    return _getFactory();
  }

  function getImpl() external view returns (address) {
    return _getImpl();
  }

  // internal getters

  function _getFactory() internal view returns (address) {
    return StorageSlot.getAddressSlot(FACTORY_SLOT).value;
  }

  function _getImpl() internal view returns (address) {
    return StorageSlot.getAddressSlot(IMPL_SLOT).value;
  }

  // internal setters

  function _setFactory(address factory) internal {
    StorageSlot.getAddressSlot(FACTORY_SLOT).value = factory;
  }

  function _setImpl(address impl) internal {
    StorageSlot.getAddressSlot(IMPL_SLOT).value = impl;
  }
}
