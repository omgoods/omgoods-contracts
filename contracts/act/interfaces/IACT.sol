// SPDX-License-Identifier: None
pragma solidity 0.8.28;

interface IACT {
  // deployment

  function initialize(
    address forwarder,
    string calldata name_,
    string calldata symbol_,
    address maintainer,
    bool ready,
    uint128 epochLength,
    uint128 initialEpoch
  ) external;
}
