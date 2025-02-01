// SPDX-License-Identifier: None
pragma solidity 0.8.28;

import {Epochs} from "../../common/Epochs.sol";
import {ACTKinds} from "../enums.sol";

interface IACT {
  // deployment

  function initialize(
    address forwarder,
    string calldata name_,
    string calldata symbol_,
    address maintainer,
    bool ready,
    Epochs.Settings memory epochs
  ) external;

  // external getters

  function kind() external pure returns (ACTKinds);
}
