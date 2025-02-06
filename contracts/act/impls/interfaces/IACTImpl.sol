// SPDX-License-Identifier: None
pragma solidity 0.8.28;

import {Epochs} from "../../../common/Epochs.sol";

interface IACTImpl {
  // deployment

  function initialize(
    address entryPoint,
    address maintainer,
    string calldata name,
    string calldata symbol,
    Epochs.Settings memory epochSettings
  ) external;
}
