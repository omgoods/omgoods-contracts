// SPDX-License-Identifier: None
pragma solidity 0.8.28;

import {Context} from "@openzeppelin/contracts/utils/Context.sol";

abstract contract ForwarderContext is Context {
  // storage

  address private _forwarder;

  // external getters

  function getForwarder() external view returns (address) {
    return _getForwarder();
  }

  // internal getters

  function _getForwarder() internal view virtual returns (address) {
    return _forwarder;
  }

  function _msgSender() internal view virtual override returns (address) {
    uint256 calldataLength = msg.data.length;

    if (
      msg.sender == _getForwarder() && //
      calldataLength >= 20
    ) {
      return address(bytes20(msg.data[calldataLength - 20:]));
    } else {
      return super._msgSender();
    }
  }

  // internal setters

  function _setForwarder(address forwarder) internal virtual {
    _forwarder = forwarder;
  }
}
