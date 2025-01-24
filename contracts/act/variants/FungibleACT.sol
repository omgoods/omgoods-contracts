// SPDX-License-Identifier: None
pragma solidity 0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ACT} from "../ACT.sol";
import {FungibleACTEvents} from "./FungibleACTEvents.sol";
import {FungibleACTStorage} from "./FungibleACTStorage.sol";

contract FungibleACT is IERC20, ACT, FungibleACTStorage {
  // errors

  error InsufficientBalance(address sender, uint256 balance, uint256 needed);

  error InsufficientAllowance(
    address spender,
    uint256 allowance,
    uint256 needed
  );

  error InvalidSender(address sender);

  error InvalidReceiver(address receiver);

  error InvalidSpender(address spender);

  // deployment

  constructor() ACT() {
    //
  }

  // external getters

  function kind() external pure override returns (Kinds) {
    return Kinds.Fungible;
  }

  function decimals() external pure returns (uint8) {
    return 18;
  }

  function totalSupply() external view returns (uint256) {
    return _getTotalSupply();
  }

  function allowance(
    address owner,
    address spender
  ) external view returns (uint256) {
    return _getAllowance(owner, spender);
  }

  function balanceOf(address account) external view returns (uint256) {
    return _getBalance(account);
  }

  // external setters

  function approve(address spender, uint256 value) external returns (bool) {
    require(spender != address(0), InvalidSpender(address(0)));

    _approve(_msgSender(), spender, value);

    return true;
  }

  function transfer(
    address to,
    uint256 value
  ) external whenReadyWithExceptions returns (bool) {
    if (value == 0) {
      // nothing to do
      return false;
    }

    require(to != address(0), InvalidReceiver(address(0)));

    _transfer(_msgSender(), to, value);

    return true;
  }

  function transferFrom(
    address from,
    address to,
    uint256 value
  ) external whenReadyWithExceptions returns (bool) {
    if (value == 0) {
      // nothing to do
      return false;
    }

    require(from != address(0), InvalidSender(address(0)));
    require(to != address(0), InvalidReceiver(address(0)));

    address spender = _msgSender();

    uint256 fromAllowance = _getAllowance(from, spender);

    if (fromAllowance != type(uint256).max) {
      require(
        fromAllowance >= value,
        InsufficientAllowance(spender, fromAllowance, value)
      );

      unchecked {
        fromAllowance -= value;
      }

      _approve(from, spender, fromAllowance);
    }

    _transfer(from, to, value);

    return true;
  }

  // internal setters

  function _approve(
    address owner,
    address spender,
    uint256 value
  ) internal virtual {
    _setAllowance(owner, spender, value);

    emit Approval(owner, spender, value);

    _triggerRegistryEvent(
      abi.encodeCall(
        FungibleACTEvents.FungibleApproval,
        (owner, spender, value)
      )
    );
  }

  function _transfer(address from, address to, uint256 value) internal virtual {
    if (from == address(0)) {
      _setTotalSupply(
        _getTotalSupply() + value //
      );
    } else {
      uint256 fromBalance = _getBalance(from);

      require(
        fromBalance >= value,
        InsufficientBalance(from, fromBalance, value)
      );

      unchecked {
        _setBalance(from, fromBalance - value);
      }
    }

    unchecked {
      if (to == address(0)) {
        _setTotalSupply(
          _getTotalSupply() - value //
        );
      } else {
        _setBalance(
          to, //
          _getBalance(to) + value
        );
      }
    }

    emit Transfer(from, to, value);

    _triggerRegistryEvent(
      abi.encodeCall(FungibleACTEvents.FungibleTransfer, (from, to, value))
    );
  }
}
