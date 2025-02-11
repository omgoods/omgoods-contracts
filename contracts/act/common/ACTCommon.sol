// SPDX-License-Identifier: None
pragma solidity 0.8.28;

import {StorageSlot} from "@openzeppelin/contracts/utils/StorageSlot.sol";
import {Epochs} from "../../common/Epochs.sol";
import {Expandable} from "../../common/Expandable.sol";
import {IACTRegistry} from "../registry/interfaces/IACTRegistry.sol";
import {ACTCommonStorage} from "./ACTCommonStorage.sol";

abstract contract ACTCommon is Expandable, ACTCommonStorage {
  using Epochs for Epochs.Checkpoints;

  // errors

  error MsgSenderIsNotTheEntryPoint();

  error MsgSenderIsNotTheOwner();

  error MsgSenderIsNotTheMaintainer();

  error MsgSenderIsNotTheOwnerOrMaintainer();

  error ZeroAddressSender();

  error ZeroAddressReceiver();

  error ZeroAddressSpender();

  error OverflowedTotalSupply();

  error InsufficientBalance();

  // modifiers

  modifier onlyEntryPoint() {
    _requireOnlyEntryPoint();

    _;
  }

  modifier onlyOwner() {
    _requireOnlyOwner(_getSettings());

    _;
  }

  modifier onlyOwnerOrMaintainer() {
    _requireOnlyOwnerOrMaintainer(_getMaintainerSlot().value);

    _;
  }

  modifier onlyMaintainerWhenLocked() {
    _requireOnlyMaintainerWhenLocked(_getSettings());

    _;
  }

  // internal getters

  function _requireOnlyEntryPoint() internal view {
    require(_isEntryPointCall(), MsgSenderIsNotTheEntryPoint());
  }

  function _requireOnlyOwner(Settings memory settings) internal view {
    if (!_isSelfCall() && !_isEntryPointCall()) {
      require(
        msg.sender == _getOwner(_getMaintainerSlot().value, settings),
        MsgSenderIsNotTheOwner()
      );
    }
  }

  function _requireOnlyOwnerOrMaintainer(address maintainer) internal view {
    if (!_isSelfCall() && !_isEntryPointCall()) {
      require(
        msg.sender == maintainer ||
          msg.sender == _getOwner(maintainer, _getSettings()),
        MsgSenderIsNotTheOwnerOrMaintainer()
      );
    }
  }

  function _requireOnlyMaintainer() internal view {
    require(
      msg.sender == _getMaintainerSlot().value,
      MsgSenderIsNotTheMaintainer()
    );
  }

  function _requireOnlyMaintainerWhenLocked(
    Settings memory settings
  ) internal view {
    if (settings.state == States.Locked) {
      require(
        msg.sender == _getMaintainerSlot().value,
        MsgSenderIsNotTheMaintainer()
      );
    }
  }

  function _getOwner(
    address maintainer,
    Settings memory settings
  ) internal view returns (address) {
    return
      settings.governanceModel == GovernanceModels.AbsoluteMonarchy
        ? maintainer
        : address(this);
  }

  function _getEpoch() internal view returns (uint48) {
    return _getEpoch(_getSettings());
  }

  function _getEpoch(
    Settings memory settings
  ) internal view returns (uint48 result) {
    return
      settings.state == States.Tracked ? Epochs.calcEpoch(settings.epochs) : 0;
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

  function _isSelfCall() internal view returns (bool) {
    return msg.sender == address(this);
  }

  function _isEntryPointCall() internal view returns (bool) {
    return msg.sender == _getEntryPointSlot().value;
  }

  function _isMinterModuleCall() internal view returns (bool) {
    return _getModules().accesses[msg.sender].isMinter;
  }

  function _isBurnerModuleCall() internal view returns (bool) {
    return _getModules().accesses[msg.sender].isBurner;
  }

  function _isOperatorModuleCall() internal view returns (bool) {
    return _getModules().accesses[msg.sender].isOperator;
  }

  function _getExtension(
    bytes4 selector
  ) internal view override returns (address) {
    return _getExtensions().selectors[selector];
  }

  // internal setters

  function _transferAt(
    uint48 epoch,
    address from,
    address to,
    uint256 value
  ) internal {
    if (from == address(0)) {
      // Minting tokens: Increase the total supply by the specified value
      uint256 totalSupply_ = _getTotalSupplySlot().value + value;

      // Ensure the total supply does not exceed the maximum limit
      require(totalSupply_ <= type(uint240).max, OverflowedTotalSupply());

      // Update the total supply slot with the new value
      _getTotalSupplySlot().value = totalSupply_;

      // Record the new total supply in checkpoints
      _getTotalSupplyCheckpoints().push(epoch, totalSupply_);
    } else {
      // Transferring tokens: Decrease the balance of the sender
      StorageSlot.Uint256Slot storage fromBalanceSlot = _getBalanceSlot(from);

      uint256 fromBalance = fromBalanceSlot.value;

      // Ensure the sender has sufficient tokens for the transfer
      require(fromBalance >= value, InsufficientBalance());

      unchecked {
        fromBalance -= value;
      }

      // Update the sender's balance slot with the new value
      fromBalanceSlot.value = fromBalance;

      // Record the new balance in checkpoints for the sender
      _getBalanceCheckpoints(from).push(epoch, fromBalance);
    }

    if (to == address(0)) {
      // Burning tokens: Decrease the total supply by the specified value
      uint256 totalSupply_ = _getTotalSupplySlot().value;

      unchecked {
        totalSupply_ -= value;
      }

      // Update the total supply slot with the new value
      _getTotalSupplySlot().value = totalSupply_;

      // Record the new total supply in checkpoints
      _getTotalSupplyCheckpoints().push(epoch, totalSupply_);
    } else {
      // Transferring tokens: Increase the balance of the receiver
      StorageSlot.Uint256Slot storage toBalanceSlot = _getBalanceSlot(to);

      uint256 toBalance = toBalanceSlot.value;

      unchecked {
        toBalance += value;
      }

      // Update the receiver's balance slot with the new value
      toBalanceSlot.value = toBalance;

      // Record the new balance in checkpoints for the receiver
      _getBalanceCheckpoints(to).push(epoch, toBalance);
    }
  }

  function _triggerRegistryEvent(bytes memory data) internal {
    _triggerRegistryEvent(_getRegistrySlot().value, data);
  }

  function _triggerRegistryEvent(address registry, bytes memory data) internal {
    IACTRegistry(registry).emitTokenEvent(data);
  }
}
