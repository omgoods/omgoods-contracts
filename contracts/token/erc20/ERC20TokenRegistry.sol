// SPDX-License-Identifier: NONE
pragma solidity 0.8.20;

import {TokenRegistry} from "../TokenRegistry.sol";

contract ERC20TokenRegistry is TokenRegistry {
  // events

  event TokenTransfer(address token, address from, address to, uint256 value);

  event TokenApproval(
    address token,
    address owner,
    address spender,
    uint256 value
  );

  // deployment

  constructor(address owner) TokenRegistry(owner) {
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
