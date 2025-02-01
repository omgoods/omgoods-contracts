// SPDX-License-Identifier: None
pragma solidity 0.8.28;

import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {StorageSlot} from "@openzeppelin/contracts/utils/StorageSlot.sol";
import {ACT} from "../ACT.sol";
import {ACTKinds} from "../enums.sol";
import {FungibleACTEvents} from "./FungibleACTEvents.sol";

contract FungibleACT is IERC20Metadata, ACT {
  // slots

  bytes32 private constant ALLOWANCE_SLOT =
    keccak256(abi.encodePacked("FungibleACT#allowance"));

  // errors

  error InsufficientBalance();

  error InsufficientAllowance();

  error ZeroAddressSender();

  error ZeroAddressReceiver();

  error ZeroAddressSpender();

  // deployment

  constructor() ACT() {
    //
  }

  // external getters

  function kind() external pure override returns (ACTKinds) {
    return ACTKinds.Fungible;
  }

  function name() external view returns (string memory) {
    return _getNameSlot().value;
  }

  function symbol() external view returns (string memory) {
    return _getSymbolSlot().value;
  }

  function decimals() external pure returns (uint8) {
    return 18;
  }

  function totalSupply() external view returns (uint256) {
    return _getTotalSupplySlot().value;
  }

  function allowance(
    address owner,
    address spender
  ) external view returns (uint256) {
    return _getAllowanceSlot(owner, spender).value;
  }

  function balanceOf(address account) external view returns (uint256) {
    return _getBalanceSlot(account).value;
  }

  // external setters

  function approve(address spender, uint256 value) external returns (bool) {
    require(spender != address(0), ZeroAddressSpender());

    address owner = _msgSender();

    _getAllowanceSlot(owner, spender).value = value;

    _emitApprovalEvent(owner, spender, value);

    return true;
  }

  function transfer(address to, uint256 value) external returns (bool) {
    if (value == 0) {
      // nothing to do
      return false;
    }

    require(to != address(0), ZeroAddressReceiver());

    _transfer(_msgSender(), to, value);

    return true;
  }

  function transferFrom(
    address from,
    address to,
    uint256 value
  ) external returns (bool) {
    if (value == 0) {
      // nothing to do
      return false;
    }

    require(from != address(0), ZeroAddressSender());
    require(to != address(0), ZeroAddressReceiver());

    address spender = _msgSender();

    StorageSlot.Uint256Slot storage fromAllowanceSlot = _getAllowanceSlot(
      from,
      spender
    );

    uint256 fromAllowance = fromAllowanceSlot.value;

    if (fromAllowance != type(uint256).max) {
      require(fromAllowance >= value, InsufficientAllowance());

      unchecked {
        fromAllowanceSlot.value = fromAllowance - value;
      }

      _emitApprovalEvent(from, spender, fromAllowance);
    }

    _transfer(from, to, value);

    return true;
  }

  function mint(address to, uint256 value) external {
    if (value == 0) {
      // nothing to do
      return;
    }

    require(to != address(0), ZeroAddressReceiver());

    _transfer(address(0), to, value);
  }

  // private getters

  function _getAllowanceSlot(
    address owner,
    address spender
  ) private pure returns (StorageSlot.Uint256Slot storage) {
    return
      StorageSlot.getUint256Slot(
        keccak256(abi.encodePacked(ALLOWANCE_SLOT, owner, spender)) //
      );
  }

  // private setters

  function _transfer(address from, address to, uint256 value) private {
    uint48 epoch = _getEpoch();

    if (from == address(0)) {
      uint256 totalSupply_ = _getTotalSupplySlot().value + value;

      _getTotalSupplySlot().value = totalSupply_;

      _saveTotalSupplyHistory(epoch, totalSupply_);
    } else {
      StorageSlot.Uint256Slot storage fromBalanceSlot = _getBalanceSlot(from);

      uint256 fromBalance = fromBalanceSlot.value;

      require(fromBalance >= value, InsufficientBalance());

      unchecked {
        fromBalance -= value;

        fromBalanceSlot.value = fromBalance;

        _saveBalanceHistory(from, epoch, fromBalance);
      }
    }

    unchecked {
      if (to == address(0)) {
        uint256 totalSupply_ = _getTotalSupplySlot().value - value;

        _getTotalSupplySlot().value = totalSupply_;

        _saveTotalSupplyHistory(epoch, totalSupply_);
      } else {
        StorageSlot.Uint256Slot storage toBalanceSlot = _getBalanceSlot(to);

        uint256 toBalance = toBalanceSlot.value + value;

        toBalanceSlot.value = toBalance;

        _saveBalanceHistory(to, epoch, toBalance);
      }
    }

    _emitTransferEvent(from, to, epoch, value);
  }

  function _emitApprovalEvent(
    address owner,
    address spender,
    uint256 value
  ) private {
    emit Approval(owner, spender, value);

    _triggerRegistryEvent(
      abi.encodeCall(
        FungibleACTEvents.FungibleApproval,
        (owner, spender, value)
      )
    );
  }

  function _emitTransferEvent(
    address from,
    address to,
    uint48 epoch,
    uint256 value
  ) private {
    emit Transfer(from, to, value);

    _triggerRegistryEvent(
      abi.encodeCall(
        FungibleACTEvents.FungibleTransfer,
        (from, to, epoch, value)
      )
    );
  }
}
