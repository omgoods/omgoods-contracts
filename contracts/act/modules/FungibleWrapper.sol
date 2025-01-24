// SPDX-License-Identifier: None
pragma solidity 0.8.28;

import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {FungibleACT} from "../variants/FungibleACT.sol";
import {ACTModule} from "../ACTModule.sol";

contract FungibleWrapper is ACTModule {
  string private constant SYMBOL_PREFIX = "w";

  mapping(FungibleACT token => IERC20Metadata underlyingToken)
    private underlyingTokens;

  // external setters

  function initialize(
    FungibleACT token,
    IERC20Metadata underlyingToken
  ) external {
    require(token.hasModuleEnabled(address(this)));
    require(address(underlyingTokens[token]) == address(0));

    require(
      keccak256(
        abi.encodePacked(
          token.symbol() //
        )
      ) ==
        keccak256(
          abi.encodePacked(
            SYMBOL_PREFIX, //
            underlyingToken.symbol()
          )
        )
    );

    underlyingTokens[token] = underlyingToken;
  }
}
