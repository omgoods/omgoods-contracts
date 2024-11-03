// SPDX-License-Identifier: None
pragma solidity 0.8.27;

import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

contract TokenHelper {
  function getTokenMetadata(
    address token
  )
    external
    view
    returns (string memory name, string memory symbol, uint8 decimals)
  {
    bytes memory data = _callToken(token, IERC20Metadata.symbol.selector);

    if (data.length != 0) {
      (symbol) = abi.decode(data, (string));

      data = _callToken(token, IERC20Metadata.name.selector);

      if (data.length == 0) {
        name = symbol;
      } else {
        (name) = abi.decode(data, (string));
      }

      data = _callToken(token, IERC20Metadata.decimals.selector);

      if (data.length != 0) {
        (decimals) = abi.decode(data, (uint8));
      }
    }

    return (name, symbol, decimals);
  }

  // internal getters

  function _callToken(
    address token,
    bytes4 selector
  ) internal view returns (bytes memory result) {
    if (token != address(0)) {
      (bool success, bytes memory data) = token.staticcall(
        abi.encodeWithSelector(selector)
      );

      if (success) {
        result = data;
      }
    }

    return result;
  }
}
