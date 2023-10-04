// SPDX-License-Identifier: None
pragma solidity 0.8.21;

import {TokenFactory} from "../TokenFactory.sol";

abstract contract ERC20TokenFactory is TokenFactory {
  // events

  event TokenTransfer(address token, address from, address to, uint256 value);

  event TokenApproval(
    address token,
    address owner,
    address spender,
    uint256 value
  );

  // deployment

  constructor(address owner, string memory name) TokenFactory(owner, name) {
    //
  }

  // external setters

  function emitTokenTransfer(
    address from,
    address to,
    uint256 value
  ) external onlyToken {
    emit TokenTransfer(msg.sender, from, to, value);
  }

  function emitTokenApproval(
    address owner,
    address spender,
    uint256 value
  ) external onlyToken {
    emit TokenApproval(msg.sender, owner, spender, value);
  }
}
