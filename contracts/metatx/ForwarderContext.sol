// SPDX-License-Identifier: None
pragma solidity 0.8.28;

import {Context} from "@openzeppelin/contracts/utils/Context.sol";
import {StorageSlot} from "@openzeppelin/contracts/utils/StorageSlot.sol";

abstract contract ForwarderContext is Context {
  // slots

  bytes32 private constant FORWARDER_SLOT =
    keccak256(abi.encodePacked("ForwarderContext#forwarder"));

  // external getters

  function getForwarder() external view returns (address) {
    return _getForwarderSlot().value;
  }

  // internal getters

  function _getForwarderSlot()
    internal
    view
    virtual
    returns (StorageSlot.AddressSlot storage)
  {
    return StorageSlot.getAddressSlot(FORWARDER_SLOT);
  }

  function _msgSender() internal view virtual override returns (address) {
    uint256 dataLength = msg.data.length;

    if (dataLength >= 20 && msg.sender == _getForwarderSlot().value) {
      return address(bytes20(msg.data[dataLength - 20:]));
    } else {
      return super._msgSender();
    }
  }
}
