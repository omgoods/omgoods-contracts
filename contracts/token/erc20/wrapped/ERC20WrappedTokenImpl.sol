// SPDX-License-Identifier: None
pragma solidity 0.8.21;

import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ProxyImpl} from "../../../common/proxy/ProxyImpl.sol";
import {ERC20Token} from "../ERC20Token.sol";

contract ERC20WrappedTokenImpl is ProxyImpl, ERC20Token {
  using SafeERC20 for IERC20Metadata;

  // storage

  IERC20Metadata private _underlyingToken;

  // deployment

  constructor() ERC20Token(address(0)) {
    _initialized = true; // singleton
  }

  function initialize(
    address gateway,
    address tokenRegistry,
    address underlyingToken
  ) external {
    _initialize(gateway, tokenRegistry);

    _underlyingToken = IERC20Metadata(underlyingToken);
  }

  // external getters

  function name() external view override returns (string memory) {
    return _underlyingToken.name();
  }

  function symbol() external view override returns (string memory) {
    return _underlyingToken.symbol();
  }

  function decimals() external view override returns (uint8) {
    return _underlyingToken.decimals();
  }

  function getUnderlyingToken() external view returns (address) {
    return address(_underlyingToken);
  }

  // external setters

  function deposit(uint256 amount) external {
    address sender = _msgSender();

    _deposit(sender, sender, amount);
  }

  function depositTo(address to, uint256 amount) external {
    _deposit(_msgSender(), to, amount);
  }

  function withdraw(uint256 amount) external {
    address sender = _msgSender();

    _withdraw(sender, sender, amount);
  }

  function withdrawTo(address to, uint256 amount) external {
    _withdraw(_msgSender(), to, amount);
  }

  // private setters

  function _deposit(address from, address to, uint256 amount) private {
    _underlyingToken.safeTransferFrom(from, address(this), amount);

    _mint(to, amount);
  }

  function _withdraw(address from, address to, uint256 amount) private {
    _burn(from, amount);

    _underlyingToken.safeTransfer(to, amount);
  }
}
