// SPDX-License-Identifier: None
pragma solidity 0.8.28;

import {Epochs} from "../../common/Epochs.sol";
import {ACTVariants} from "../enums.sol";

interface IACT {
  // deployment

  function initialize(
    address forwarder,
    string calldata name,
    string calldata symbol,
    address maintainer,
    Epochs.Settings memory epochSettings
  ) external;

  // external getters

  function variant() external pure returns (ACTVariants);
}
