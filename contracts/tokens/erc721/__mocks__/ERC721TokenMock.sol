// SPDX-License-Identifier: None
pragma solidity 0.8.21;

import {ERC721Token} from "../ERC721Token.sol";

contract ERC721TokenMock is ERC721Token {
  // deployment

  function initialize(
    address tokenRegistry,
    bool locked,
    uint256[] calldata tokenIds
  ) external {
    _initialize(address(0), tokenRegistry, locked);

    uint256 len = tokenIds.length;

    for (uint256 index; index < len; ) {
      _mint(msg.sender, tokenIds[index]);

      unchecked {
        index += 1;
      }
    }
  }
}
