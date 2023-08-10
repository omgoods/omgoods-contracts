// SPDX-License-Identifier: NONE
pragma solidity 0.8.20;

import {IERC1271} from "@openzeppelin/contracts/interfaces/IERC1271.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {AccountExtension} from "./AccountExtension.sol";

abstract contract ERC1271Account is IERC1271, AccountExtension {
  using ECDSA for bytes32;

  // external functions (getters)

  function isValidSignature(
    bytes32 hash,
    bytes calldata signature
  ) external view returns (bytes4) {
    address signer = hash.recover(signature);

    return
      _hasOwner(signer) ? this.isValidSignature.selector : bytes4(0xffffffff);
  }
}
