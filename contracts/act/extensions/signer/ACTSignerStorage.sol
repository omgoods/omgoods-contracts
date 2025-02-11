// SPDX-License-Identifier: None
pragma solidity 0.8.28;

import {IACTSignerTypes} from "./interfaces/IACTSignerTypes.sol";

contract ACTSignerStorage is IACTSignerTypes {
  // slots

  bytes32 private constant SIGNATURE_SLOT =
    keccak256(abi.encodePacked("act.extensions.signer#signature"));

  // internal getters

  function _getSignature(
    bytes32 hash
  ) internal pure returns (Signature storage result) {
    bytes32 slot = keccak256(abi.encodePacked(SIGNATURE_SLOT, hash));

    // solhint-disable-next-line no-inline-assembly
    assembly ("memory-safe") {
      result.slot := slot
    }

    return result;
  }
}
