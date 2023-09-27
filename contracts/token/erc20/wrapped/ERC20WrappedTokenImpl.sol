// SPDX-License-Identifier: None
pragma solidity 0.8.21;

import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ERC20TokenImpl} from "../ERC20TokenImpl.sol";

contract ERC20WrappedTokenImpl is ERC20TokenImpl {
  // storage

  address private _underlyingToken;

  // deployment

  constructor() ERC20TokenImpl() {
    //
  }

  function initialize(address gateway, address underlyingToken) external {
    _initialize(gateway);

    _underlyingToken = underlyingToken;
  }

  // public getters

  function name() public view override returns (string memory) {
    return IERC20Metadata(_underlyingToken).name();
  }

  function symbol() public view override returns (string memory) {
    return IERC20Metadata(_underlyingToken).symbol();
  }
}
