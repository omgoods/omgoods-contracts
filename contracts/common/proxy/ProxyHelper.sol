// SPDX-License-Identifier: None
pragma solidity 0.8.21;

import {Proxy} from "./Proxy.sol";

library ProxyHelper {
  // internal getters

  function computeProxy(
    address deployer,
    address proxyImpl,
    bytes32 salt
  ) internal pure returns (address) {
    bytes memory creationCode = abi.encodePacked(
      type(Proxy).creationCode,
      bytes12(0),
      proxyImpl
    );

    bytes32 data = keccak256(
      abi.encodePacked(bytes1(0xff), deployer, salt, keccak256(creationCode))
    );

    return address(uint160(uint256(data)));
  }
}
