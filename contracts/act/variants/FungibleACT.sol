// SPDX-License-Identifier: None
pragma solidity 0.8.28;

import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {StorageSlot} from "@openzeppelin/contracts/utils/StorageSlot.sol";
import {ACT} from "../ACT.sol";
import {ACTCore} from "../ACTCore.sol";
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

  function kind() external pure override returns (ACTCore.Kinds) {
    return ACTCore.Kinds.Fungible;
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

    address from = _msgSender();

    require(to != address(0), ZeroAddressReceiver());

    _transfer(from, to, value, value);

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

    _transfer(from, to, value, value);

    return true;
  }

  function mint(address to, uint256 value, uint256 votingUnits) external {
    if (value == 0) {
      // nothing to do
      return;
    }

    require(to != address(0), ZeroAddressReceiver());

    _transfer(address(0), to, value, votingUnits);
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

  function _transfer(
    address from,
    address to,
    uint256 value,
    uint256 votingUnits
  ) private {
    if (from == address(0)) {
      _getTotalSupplySlot().value += value;
    } else {
      StorageSlot.Uint256Slot storage fromBalanceSlot = _getBalanceSlot(from);
      uint256 fromBalance = fromBalanceSlot.value;

      require(fromBalance >= value, InsufficientBalance());

      unchecked {
        fromBalanceSlot.value = fromBalance - value;
      }
    }

    unchecked {
      if (to == address(0)) {
        _getTotalSupplySlot().value -= value;
      } else {
        _getBalanceSlot(to).value += value;
      }
    }

    _transferVotingUnits(from, to, votingUnits);

    _emitTransferEvent(from, to, value, votingUnits);
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
    uint256 value,
    uint256 votingUnits
  ) private {
    emit Transfer(from, to, value);

    _triggerRegistryEvent(
      abi.encodeCall(
        FungibleACTEvents.FungibleTransfer,
        (from, to, value, votingUnits)
      )
    );
  }
}
