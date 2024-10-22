// SPDX-License-Identifier: None
pragma solidity 0.8.27;

contract StaticCaller {
  // external getters

  function callTarget(
    address target,
    bytes[] calldata data
  ) external view returns (bytes[] memory result) {
    if (target != address(0)) {
      uint256 len = data.length;

      result = new bytes[](len);

      for (uint256 index; index < len; ) {
        (bool success, bytes memory returnData) = target.staticcall(
          data[index]
        );

        if (success) {
          result[index] = returnData;
        }

        unchecked {
          index += 1;
        }
      }
    }

    return result;
  }

  function callTargets(
    address[] calldata targets,
    bytes[] calldata data
  ) external view returns (bytes[] memory result) {
    uint256 len = targets.length;

    if (data.length == len) {
      result = new bytes[](len);

      for (uint256 index; index < len; ) {
        if (targets[index] != address(0)) {
          (bool success, bytes memory returnData) = targets[index].staticcall(
            data[index]
          );

          if (success) {
            result[index] = returnData;
          }
        }

        unchecked {
          index += 1;
        }
      }
    }

    return result;
  }
}
