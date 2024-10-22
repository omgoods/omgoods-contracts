// SPDX-License-Identifier: None
pragma solidity 0.8.27;

import {Context} from "@openzeppelin/contracts/utils/Context.sol";

abstract contract ForwarderContext is Context {
  uint256 private constant SUFFIX_TOTAL_LENGTH = 20;

  // storage

  address internal _forwarder;

  // external getters

  function forwarder() external view returns (address) {
    return _forwarder;
  }

  // internal getters

  function _msgSender() internal view virtual override returns (address) {
    uint256 calldataLength = msg.data.length;

    if (
      msg.sender == _forwarder && //
      calldataLength >= SUFFIX_TOTAL_LENGTH
    ) {
      return address(bytes20(msg.data[calldataLength - SUFFIX_TOTAL_LENGTH:]));
    } else {
      return super._msgSender();
    }
  }
}
