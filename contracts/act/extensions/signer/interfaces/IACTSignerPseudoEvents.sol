// SPDX-License-Identifier: None
pragma solidity 0.8.28;

import {IACTSignerTypes} from "./IACTSignerTypes.sol";

/* solhint-disable func-name-mixedcase */

interface IACTSignerPseudoEvents is IACTSignerTypes {
  // pseudo events

  function SignatureUpdated(
    bytes32 hash,
    Signature calldata signature
  ) external view;
}
