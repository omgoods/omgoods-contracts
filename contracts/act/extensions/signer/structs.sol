// SPDX-License-Identifier: None
pragma solidity 0.8.28;

import {ACTSignerSignatureModes} from "./enums.sol";

struct ACTSignerSignature {
  ACTSignerSignatureModes mode;
  uint48 validAfter;
  uint48 validUntil;
}
