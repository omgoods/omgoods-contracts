// SPDX-License-Identifier: None
pragma solidity 0.8.28;

import {Epochs} from "../common/Epochs.sol";
import {ForwarderContext} from "../metatx/ForwarderContext.sol";
import {IACTRegistry} from "./interfaces/IACTRegistry.sol";
import {ACTStorage} from "./ACTStorage.sol";
import {ACTSystems} from "./enums.sol";
import {ACTSettings} from "./structs.sol";

abstract contract ACTCore is ACTStorage, ForwarderContext {
  using Epochs for Epochs.Checkpoints;

  // internal getters

  function _getForwarder() internal view override returns (address) {
    return _getForwarderSlot().value;
  }

  function _getOwner() internal view returns (address) {
    return _getOwner(_getSettings());
  }

  function _getOwner(
    ACTSettings memory settings
  ) internal view returns (address) {
    return
      ACTSystems(settings.system) == ACTSystems.AbsoluteMonarchy
        ? _getMaintainerSlot().value
        : address(this);
  }

  function _getEpoch() internal view returns (uint48) {
    return _getEpoch(_getSettings());
  }

  function _getEpoch(
    ACTSettings memory settings
  ) internal view returns (uint48 result) {
    return Epochs.calcEpoch(settings.epochs);
  }

  function _getTotalSupplyAt(uint48 epoch) internal view returns (uint256) {
    return
      _getTotalSupplyCheckpoints().lookup(
        epoch,
        _getEpoch(),
        _getTotalSupplySlot().value
      );
  }

  function _getBalanceAt(
    uint48 epoch,
    address account
  ) internal view returns (uint256) {
    return
      _getBalanceCheckpoints(account).lookup(
        epoch,
        _getEpoch(),
        _getBalanceSlot(account).value
      );
  }

  // internal setters

  function _triggerRegistryEvent(bytes memory data) internal {
    _triggerRegistryEvent(_getRegistrySlot().value, data);
  }

  function _triggerRegistryEvent(address registry, bytes memory data) internal {
    if (registry != address(0)) {
      IACTRegistry(registry).emitTokenEvent(data);
    }
  }
}
