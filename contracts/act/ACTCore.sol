// SPDX-License-Identifier: None
pragma solidity 0.8.28;

import {StorageSlot} from "@openzeppelin/contracts/utils/StorageSlot.sol";
import {Epochs} from "../common/Epochs.sol";
import {IOwnable} from "../common/interfaces/IOwnable.sol";
import {ForwarderContext} from "../metatx/ForwarderContext.sol";
import {IACTRegistry} from "./interfaces/IACTRegistry.sol";
import {ACTStorage} from "./ACTStorage.sol";
import {ACTStates, ACTSystems} from "./enums.sol";
import {ACTSettings} from "./structs.sol";

abstract contract ACTCore is IOwnable, ACTStorage, ForwarderContext {
  using Epochs for Epochs.Checkpoints;

  // errors

  error MsgSenderIsNotTheOwnerOrMaintainer();

  error ZeroAddressSender();

  error ZeroAddressReceiver();

  error ZeroAddressSpender();

  error OverflowedTotalSupply();

  error InsufficientBalance();

  // modifiers

  modifier onlyOwner() {
    _requireOnlyOwner(_getSettings());

    _;
  }

  modifier onlyOwnerOrMaintainer() {
    _requireOnlyOwnerOrMaintainer(_getMaintainerSlot().value);

    _;
  }

  // external getters

  function getOwner() external view returns (address) {
    return _getOwner(_getMaintainerSlot().value, _getSettings());
  }

  // internal getters

  function _requireOnlyOwner(ACTSettings memory settings) internal view {
    _requireOnlyOwner(_msgSender(), settings);
  }

  function _requireOnlyOwner(
    address msgSender,
    ACTSettings memory settings
  ) internal view {
    require(
      msgSender == _getOwner(_getMaintainerSlot().value, settings),
      MsgSenderIsNotTheOwner()
    );
  }

  function _requireOnlyOwnerOrMaintainer(address maintainer) internal view {
    address msgSender = _msgSender();

    require(
      msgSender == maintainer ||
        msgSender == _getOwner(maintainer, _getSettings()),
      MsgSenderIsNotTheOwnerOrMaintainer()
    );
  }

  function _getForwarder() internal view override returns (address) {
    return _getForwarderSlot().value;
  }

  function _getOwner(
    address maintainer,
    ACTSettings memory settings
  ) internal view returns (address) {
    return
      settings.system == ACTSystems.AbsoluteMonarchy
        ? maintainer
        : address(this);
  }

  function _getEpoch() internal view returns (uint48) {
    return _getEpoch(_getSettings());
  }

  function _getEpoch(
    ACTSettings memory settings
  ) internal view returns (uint48 result) {
    return
      settings.state == ACTStates.Tracked
        ? Epochs.calcEpoch(settings.epochs)
        : 0;
  }

  function _getTotalSupplyAt(
    uint48 epoch,
    uint48 currentEpoch
  ) internal view returns (uint256) {
    return
      _getTotalSupplyCheckpoints().lookup(
        epoch,
        currentEpoch,
        _getTotalSupplySlot().value
      );
  }

  function _getBalanceAt(
    uint48 epoch,
    uint48 currentEpoch,
    address account
  ) internal view returns (uint256) {
    return
      _getBalanceCheckpoints(account).lookup(
        epoch,
        currentEpoch,
        _getBalanceSlot(account).value
      );
  }

  function _isMinterModule(address module) internal view returns (bool) {
    return _getModules().accesses[module].isMinter;
  }

  function _isBurnerModule(address module) internal view returns (bool) {
    return _getModules().accesses[module].isBurner;
  }

  function _isOperatorModule(address module) internal view returns (bool) {
    return _getModules().accesses[module].isOperator;
  }

  // internal setters

  function _transferAt(
    uint48 epoch,
    address from,
    address to,
    uint256 value
  ) internal {
    if (from == address(0)) {
      uint256 totalSupply_ = _getTotalSupplySlot().value + value;

      require(totalSupply_ <= type(uint240).max, OverflowedTotalSupply());

      _getTotalSupplySlot().value = totalSupply_;

      _getTotalSupplyCheckpoints().push(epoch, totalSupply_);
    } else {
      StorageSlot.Uint256Slot storage fromBalanceSlot = _getBalanceSlot(from);

      uint256 fromBalance = fromBalanceSlot.value;

      require(fromBalance >= value, InsufficientBalance());

      unchecked {
        fromBalance -= value;
      }

      fromBalanceSlot.value = fromBalance;

      _getBalanceCheckpoints(from).push(epoch, fromBalance);
    }

    if (to == address(0)) {
      uint256 totalSupply_ = _getTotalSupplySlot().value;

      unchecked {
        totalSupply_ -= value;
      }

      _getTotalSupplySlot().value = totalSupply_;

      _getTotalSupplyCheckpoints().push(epoch, totalSupply_);
    } else {
      StorageSlot.Uint256Slot storage toBalanceSlot = _getBalanceSlot(to);

      uint256 toBalance = toBalanceSlot.value;

      unchecked {
        toBalance += value;
      }

      toBalanceSlot.value = toBalance;

      _getBalanceCheckpoints(to).push(epoch, toBalance);
    }
  }

  function _triggerRegistryEvent(bytes memory data) internal {
    address registry = _getRegistrySlot().value;

    if (registry != address(0)) {
      IACTRegistry(registry).emitTokenEvent(data);
    }
  }
}
