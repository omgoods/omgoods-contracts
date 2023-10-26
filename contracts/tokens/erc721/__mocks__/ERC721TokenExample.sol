// SPDX-License-Identifier: None
pragma solidity 0.8.21;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract ERC721TokenExample is ERC721 {
  // deployment

  constructor(uint256[] memory tokenIds) ERC721("Example", "EXAMPLE") {
    uint256 len = tokenIds.length;

    for (uint256 index; index < len; ) {
      _mint(msg.sender, tokenIds[index]);

      unchecked {
        index += 1;
      }
    }
  }
}
