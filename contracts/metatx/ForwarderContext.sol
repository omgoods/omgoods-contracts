// SPDX-License-Identifier: None
pragma solidity 0.8.28;

import {Context} from "@openzeppelin/contracts/utils/Context.sol";

abstract contract ForwarderContext is Context {
  // storage

  address internal _forwarder;

  // external getters

  function getForwarder() external view returns (address) {
    return _getForwarder();
  }

  // internal getters

  function _getForwarder() internal view virtual returns (address) {
    return _forwarder;
  }

  function _msgSender() internal view virtual override returns (address) {
    uint256 dataLength = msg.data.length;

    if (dataLength >= 20 && msg.sender == _getForwarder()) {
      return address(bytes20(msg.data[dataLength - 20:]));
    } else {
      return super._msgSender();
    }
  }
}
