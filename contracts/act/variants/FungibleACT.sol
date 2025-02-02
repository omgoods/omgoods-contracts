// SPDX-License-Identifier: None
pragma solidity 0.8.28;

import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {StorageSlot} from "@openzeppelin/contracts/utils/StorageSlot.sol";
import {ACT} from "../ACT.sol";
import {ACTVariants} from "../enums.sol";
import {ACTSettings} from "../structs.sol";
import {FungibleACTEvents} from "./FungibleACTEvents.sol";
import {FungibleACTStorage} from "./FungibleACTStorage.sol";

contract FungibleACT is IERC20Metadata, ACT, FungibleACTStorage {
  // errors

  error InsufficientAllowance();

  // deployment

  constructor() ACT() {
    //
  }

  // external getters

  function variant() external pure override returns (ACTVariants) {
    return ACTVariants.Fungible;
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
    ACTSettings memory settings = _getSettings();

    require(to != address(0), ZeroAddressReceiver());

    if (value == 0) {
      // nothing to do
      return false;
    }

    uint48 epoch = _getEpoch(settings);
    address from = _msgSender();

    _transferAt(epoch, from, to, value);

    _emitTransferEvent(epoch, from, to, value);

    return true;
  }

  function transferFrom(
    address from,
    address to,
    uint256 value
  ) external returns (bool) {
    ACTSettings memory settings = _getSettings();

    require(from != address(0), ZeroAddressSender());

    require(to != address(0), ZeroAddressReceiver());

    if (value == 0) {
      // nothing to do
      return false;
    }

    address spender = _msgSender();

    if (!_isOperatorModule(spender)) {
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
    }

    uint48 epoch = _getEpoch(settings);

    _transferAt(epoch, from, to, value);

    _emitTransferEvent(epoch, from, to, value);

    return true;
  }

  function mint(address to, uint256 value) external returns (bool) {
    address msgSender = _msgSender();
    ACTSettings memory settings = _getSettings();

    if (!_isMinterModule(msgSender)) {
      _requireOnlyOwner(msgSender, settings);
    }

    require(to != address(0), ZeroAddressReceiver());

    if (value == 0) {
      // nothing to do
      return false;
    }

    uint48 epoch = _getEpoch(settings);

    _transferAt(epoch, address(0), to, value);

    _emitTransferEvent(epoch, address(0), to, value);

    return true;
  }

  function burn(address from, uint256 value) external returns (bool) {
    address msgSender = _msgSender();

    ACTSettings memory settings = _getSettings();

    if (!_isBurnerModule(msgSender)) {
      _requireOnlyOwner(msgSender, settings);
    }

    require(from != address(0), ZeroAddressSender());

    if (value == 0) {
      // nothing to do
      return false;
    }

    uint48 epoch = _getEpoch(settings);

    _transferAt(epoch, from, address(0), value);

    _emitTransferEvent(epoch, from, address(0), value);

    return true;
  }

  // private setters

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
    uint48 epoch,
    address from,
    address to,
    uint256 value
  ) private {
    emit Transfer(from, to, value);

    _triggerRegistryEvent(
      abi.encodeCall(
        FungibleACTEvents.FungibleTransfer,
        (epoch, from, to, value)
      )
    );
  }
}
