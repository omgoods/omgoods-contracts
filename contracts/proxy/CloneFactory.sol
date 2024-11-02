// SPDX-License-Identifier: None
pragma solidity 0.8.27;

import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";
import {CloneTarget} from "./CloneTarget.sol";

abstract contract CloneFactory {
  // storage

  address private immutable _target;

  // deployment

  constructor(address target) {
    _target = target;
  }

  // internal getters

  function _computeClone(bytes32 salt) internal view returns (address) {
    return Clones.predictDeterministicAddress(_target, salt, address(this));
  }

  // internal setters

  function _createClone(
    bytes32 salt,
    address impl,
    bytes memory initData
  ) internal returns (address result) {
    result = Clones.cloneDeterministic(_target, salt);

    CloneTarget clone = CloneTarget(payable(result));

    clone.initialize(impl, initData);

    return address(clone);
  }
}
