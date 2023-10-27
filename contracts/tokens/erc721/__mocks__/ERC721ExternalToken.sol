// SPDX-License-Identifier: None
pragma solidity 0.8.21;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract ERC721ExternalToken is ERC721 {
  // deployment

  constructor(
    string memory name_,
    string memory symbol_,
    uint256[] memory tokenIds
  ) ERC721(name_, symbol_) {
    uint256 len = tokenIds.length;

    for (uint256 index; index < len; ) {
      _mint(msg.sender, tokenIds[index]);

      unchecked {
        index += 1;
      }
    }
  }
}
