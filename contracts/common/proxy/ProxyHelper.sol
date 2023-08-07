// SPDX-License-Identifier: NONE
pragma solidity 0.8.20;

import {Proxy} from "./Proxy.sol";

library ProxyHelper {
  // internal functions (getters)

  function computeProxy(
    address deployer,
    address implementation,
    bytes32 salt
  ) internal pure returns (address) {
    bytes memory creationCode = abi.encodePacked(
      type(Proxy).creationCode,
      bytes12(0),
      implementation
    );

    bytes32 data = keccak256(
      abi.encodePacked(bytes1(0xff), deployer, salt, keccak256(creationCode))
    );

    return address(uint160(uint256(data)));
  }
}
