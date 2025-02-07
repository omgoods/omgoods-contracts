// SPDX-License-Identifier: None
pragma solidity 0.8.28;

import {ACTSignerSignature} from "../structs.sol";

/* solhint-disable func-name-mixedcase */

interface IACTSignerEvents {
  // pseudo events

  function SignatureUpdated(
    bytes32 hash,
    ACTSignerSignature calldata signature
  ) external view;
}
