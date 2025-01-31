// SPDX-License-Identifier: None
pragma solidity 0.8.28;

import {ACTCore} from "../ACTCore.sol";

interface IACT {
  // deployment

  function initialize(
    address forwarder,
    string calldata name_,
    string calldata symbol_,
    address maintainer,
    bool ready,
    uint48 epochLength
  ) external;

  // external getters

  function kind() external pure returns (ACTCore.Kinds);
}
