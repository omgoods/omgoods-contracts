// SPDX-License-Identifier: None
pragma solidity 0.8.28;

import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";
import {Time} from "@openzeppelin/contracts/utils/types/Time.sol";
import {ForwarderContext} from "../metatx/ForwarderContext.sol";
import {IACT} from "./interfaces/IACT.sol";
import {IACTRegistry} from "./interfaces/IACTRegistry.sol";

contract ACTRegistry is ForwarderContext, IACTRegistry {
  // events

  event TokenEvent(address token, bytes data, uint256 timestamp);

  // external setters

  function createToken(
    address variant,
    string calldata name,
    string calldata symbol,
    address maintainer,
    bool ready,
    uint48 epochLength
  ) external returns (address result) {
    result = Clones.cloneDeterministic(variant, _computeTokenSalt(symbol));

    IACT token = IACT(result);

    token.initialize(
      _getForwarderSlot().value, //
      name,
      symbol,
      maintainer,
      ready,
      epochLength
    );

    return result;
  }

  function emitTokenEvent(bytes calldata data) external {
    emit TokenEvent(msg.sender, data, block.timestamp);
  }

  // external getters

  function computeTokenAddress(
    address variant,
    string calldata symbol
  ) external view returns (address) {
    return
      Clones.predictDeterministicAddress(
        variant,
        _computeTokenSalt(symbol),
        address(this)
      );
  }

  // private getters

  function _computeTokenSalt(
    string calldata symbol
  ) private pure returns (bytes32) {
    return keccak256(abi.encodePacked(symbol));
  }
}
