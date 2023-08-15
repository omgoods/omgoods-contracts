// SPDX-License-Identifier: NONE
pragma solidity 0.8.21;

import {TokenRegistry} from "../TokenRegistry.sol";

contract ERC20TokenRegistry is TokenRegistry {
  // events

  event TokenTransfer(address token, address from, address to, uint256 amount);

  event TokenApproval(
    address token,
    address owner,
    address spender,
    uint256 amount
  );

  // deployment

  constructor(address owner) TokenRegistry(owner) {
    //
  }

  // external setters

  function emitTokenTransfer(
    address from,
    address to,
    uint256 amount
  ) external onlyToken {
    emit TokenTransfer(msg.sender, from, to, amount);
  }

  function emitTokenApproval(
    address owner,
    address spender,
    uint256 amount
  ) external onlyToken {
    emit TokenApproval(msg.sender, owner, spender, amount);
  }
}
