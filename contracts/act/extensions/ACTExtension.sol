// SPDX-License-Identifier: None
pragma solidity 0.8.28;

import {ACTCommon} from "../common/ACTCommon.sol";
import {IACTExtension} from "./interfaces/IACTExtension.sol";

abstract contract ACTExtension is ACTCommon, IACTExtension {
  // external getters

  function getSupportedSelectors()
    external
    view
    virtual
    returns (bytes4[] memory result);
}
