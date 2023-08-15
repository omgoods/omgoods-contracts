// SPDX-License-Identifier: NONE
pragma solidity 0.8.21;

import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {Token} from "../Token.sol";
import {ERC20TokenRegistry} from "./ERC20TokenRegistry.sol";

abstract contract ERC20Token is IERC20Metadata, Token {
  // storage

  string private _name;

  string private _symbol;

  uint256 private _totalSupply;

  mapping(address => uint256) private _balances;

  mapping(address => mapping(address => uint256)) private _allowances;

  // errors

  error TransferFromTheZeroAddress();

  error TransferToTheZeroAddress();

  error TransferAmountExceedsBalance();

  error MintToTheZeroAddress();

  error BurnFromTheZeroAddress();

  error BurnAmountExceedsBalance();

  error ApproveToTheZeroAddress();

  error InsufficientAllowance();

  // deployment

  constructor(address owner) Token(owner) {
    //
  }

  function _initialize(
    address gateway,
    address tokenRegistry,
    string calldata name_,
    string calldata symbol_
  ) internal {
    _name = name_;

    _symbol = symbol_;

    _initialize(gateway, tokenRegistry);
  }

  // external getters

  function name() external view returns (string memory) {
    return _name;
  }

  function symbol() external view returns (string memory) {
    return _symbol;
  }

  function decimals() external pure returns (uint8) {
    return 18;
  }

  function totalSupply() external view returns (uint256) {
    return _totalSupply;
  }

  function balanceOf(address account) external view returns (uint256) {
    return _balances[account];
  }

  function allowance(
    address owner,
    address spender
  ) external view returns (uint256) {
    return _allowances[owner][spender];
  }

  // external setters

  function transfer(address to, uint256 amount) external returns (bool) {
    _transfer(_msgSender(), to, amount);

    return true;
  }

  function transferFrom(
    address from,
    address to,
    uint256 amount
  ) external returns (bool) {
    if (from == address(0)) {
      revert TransferFromTheZeroAddress();
    }

    _spendAllowance(from, _msgSender(), amount);

    _transfer(from, to, amount);

    return true;
  }

  function approve(address spender, uint256 amount) external returns (bool) {
    if (spender == address(0)) {
      revert ApproveToTheZeroAddress();
    }

    _approve(_msgSender(), spender, amount);

    return true;
  }

  // internal setters

  function _mint(address to, uint256 amount) internal {
    if (to == address(0)) {
      revert MintToTheZeroAddress();
    }

    _totalSupply += amount;

    unchecked {
      _balances[to] += amount;
    }

    _afterTransfer(address(0), to, amount);
  }

  function _burn(address from, uint256 amount) internal {
    if (from == address(0)) {
      revert BurnFromTheZeroAddress();
    }

    uint256 fromBalance = _balances[from];

    if (fromBalance < amount) {
      revert BurnAmountExceedsBalance();
    }

    unchecked {
      _balances[from] = fromBalance - amount;
      _totalSupply -= amount;
    }

    _afterTransfer(from, address(0), amount);
  }

  // private setters

  function _transfer(address from, address to, uint256 amount) private {
    if (to == address(0)) {
      revert TransferToTheZeroAddress();
    }

    uint256 fromBalance = _balances[from];

    if (fromBalance < amount) {
      revert TransferAmountExceedsBalance();
    }

    unchecked {
      _balances[from] = fromBalance - amount;
      _balances[to] += amount;
    }

    _afterTransfer(from, to, amount);
  }

  function _approve(address owner, address spender, uint256 amount) private {
    _allowances[owner][spender] = amount;

    _afterApproval(owner, spender, amount);
  }

  function _spendAllowance(
    address owner,
    address spender,
    uint256 amount
  ) internal {
    uint256 allowance_ = _allowances[owner][spender];

    if (allowance_ != type(uint256).max) {
      if (allowance_ < amount) {
        revert InsufficientAllowance();
      }

      unchecked {
        _approve(owner, spender, allowance_ - amount);
      }
    }
  }

  function _afterTransfer(address from, address to, uint256 amount) private {
    emit Transfer(from, to, amount);

    ERC20TokenRegistry(_tokenRegistry).emitTokenTransfer(from, to, amount);
  }

  function _afterApproval(
    address owner,
    address spender,
    uint256 amount
  ) private {
    emit Approval(owner, spender, amount);

    ERC20TokenRegistry(_tokenRegistry).emitTokenApproval(
      owner,
      spender,
      amount
    );
  }
}
