// SPDX-License-Identifier: None
pragma solidity 0.8.27;

library Bytes {
  // internal getters

  function deepKeccak256(
    bytes[] calldata self
  ) internal pure returns (bytes32) {
    uint256 len = self.length;

    bytes memory data = new bytes(len * 32);

    for (uint256 index = 0; index < len; ) {
      bytes32 hash = keccak256(self[index]);

      // solhint-disable-next-line no-inline-assembly
      assembly {
        mstore(add(data, add(32, mul(index, 32))), hash)
      }

      unchecked {
        index++;
      }
    }

    return keccak256(data);
  }
}
