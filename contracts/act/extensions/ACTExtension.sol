// SPDX-License-Identifier: None
pragma solidity 0.8.28;

import {ACTCore} from "../core/ACTCore.sol";
import {IACTExtension} from "./interfaces/IACTExtension.sol";

abstract contract ACTExtension is ACTCore, IACTExtension {
  // external getters

  function getSupportedSelectors()
    external
    view
    virtual
    returns (bytes4[] memory result);
}
