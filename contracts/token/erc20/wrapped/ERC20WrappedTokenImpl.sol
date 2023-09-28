// SPDX-License-Identifier: None
pragma solidity 0.8.21;

import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ERC20TokenImpl} from "../ERC20TokenImpl.sol";

contract ERC20WrappedTokenImpl is ERC20TokenImpl {
  using SafeERC20 for IERC20Metadata;

  // storage

  IERC20Metadata private _underlyingToken;

  // deployment

  constructor() ERC20TokenImpl() {
    //
  }

  function initialize(address gateway, address underlyingToken) external {
    _initialize(gateway);

    _underlyingToken = IERC20Metadata(underlyingToken);
  }

  // public getters

  function name() public view override returns (string memory) {
    return _underlyingToken.name();
  }

  function symbol() public view override returns (string memory) {
    return _underlyingToken.symbol();
  }

  // external getters

  function getUnderlyingToken() external view returns (address) {
    return address(_underlyingToken);
  }

  // external setters

  function deposit(uint256 value) external {
    address sender = _msgSender();

    _deposit(sender, sender, value);
  }

  function depositTo(address to, uint256 value) external {
    _deposit(_msgSender(), to, value);
  }

  function withdraw(uint256 value) external {
    address sender = _msgSender();

    _withdraw(sender, sender, value);
  }

  function withdrawTo(address to, uint256 value) external {
    _withdraw(_msgSender(), to, value);
  }

  // private setters

  function _deposit(address from, address to, uint256 value) private {
    _underlyingToken.safeTransferFrom(from, address(this), value);

    _mint(to, value);
  }

  function _withdraw(address from, address to, uint256 value) private {
    _burn(from, value);

    _underlyingToken.safeTransfer(to, value);
  }
}
