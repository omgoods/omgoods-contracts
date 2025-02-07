// SPDX-License-Identifier: None
pragma solidity 0.8.28;

import {IERC1271} from "@openzeppelin/contracts/interfaces/IERC1271.sol";
import {ACTSignerSignature} from "../structs.sol";

interface IACTSigner is IERC1271 {
  // events

  event SignatureUpdated(bytes32 hash, ACTSignerSignature signature);

  // error

  error InvalidSignatureHash();

  // external getters

  function getSignature(
    bytes32 hash
  ) external view returns (ACTSignerSignature memory);

  function validateSignature(bytes32 hash) external view returns (uint256);

  // external setters

  function setSignature(
    bytes32 hash,
    ACTSignerSignature calldata signature
  ) external returns (bool);
}
