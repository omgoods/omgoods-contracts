// SPDX-License-Identifier: None
pragma solidity 0.8.28;

import {IACTExtension} from "./interfaces/IACTExtension.sol";
import {ACTCore} from "./ACTCore.sol";

abstract contract ACTExtension is IACTExtension, ACTCore {
  // external getters

  function getSupportedSelectors()
    external
    view
    virtual
    returns (bytes4[] memory result);
}
