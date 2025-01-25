// SPDX-License-Identifier: None
pragma solidity 0.8.28;

import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {ITokenMetadata} from "../interfaces/ITokenMetadata.sol";
import {ForwarderContext} from "../metatx/ForwarderContext.sol";
import {Delegatable} from "../utils/Delegatable.sol";
import {Initializable} from "../utils/Initializable.sol";
import {ACTEvents} from "./ACTEvents.sol";
import {ACTRegistry} from "./ACTRegistry.sol";
import {ACTStorage} from "./ACTStorage.sol";
import {ACTKinds, ACTSystems} from "./enums.sol";

abstract contract ACT is
  ITokenMetadata,
  ForwarderContext,
  Delegatable,
  Initializable,
  ACTStorage
{
  using ECDSA for bytes32;

  // errors

  error AlreadyInReadyState();

  error MsgSenderIsNotTheOwner(address msgSender);

  error MsgSenderIsNotTheAuthority(address msgSender);

  // events

  event NameUpdated(string name);

  event RegistryUpdated(address registry);

  event MaintainerUpdated(address maintainer);

  event SystemUpdated(ACTSystems system);

  event BecameReady();

  // deployment

  function initialize(
    address forwarder,
    string calldata name_,
    string calldata symbol_,
    address maintainer,
    bool ready
  ) external initializeOnce {
    _setForwarder(forwarder);
    _setName(name_);
    _setSymbol(symbol_);
    _setRegistry(msg.sender);

    if (maintainer == address(0) || maintainer == address(this)) {
      _setSystem(ACTSystems.Democracy);
    } else {
      _setMaintainer(maintainer);
      _setSystem(ACTSystems.AbsoluteMonarchy);
    }

    if (ready) {
      _setAsReady();
    }
  }

  // external getters

  function kind() external pure virtual returns (ACTKinds) {
    return ACTKinds.Unknown;
  }

  function name() external view returns (string memory) {
    return _getName();
  }

  function symbol() external view returns (string memory) {
    return _getSymbol();
  }

  function getRegistry() external view returns (address) {
    return _getRegistry();
  }

  function getOwner() external view returns (address) {
    return _getOwner();
  }

  function getMaintainer() external view returns (address) {
    return _getMaintainer();
  }

  function getSystem() external view returns (ACTSystems) {
    return _getSystem();
  }

  function isReady() external view returns (bool) {
    return _isReady();
  }

  // external setters

  // TODO: add sender verification
  function setName(string calldata name_) external {
    _setName(name_);

    emit NameUpdated(name_);

    _triggerRegistryEvent(abi.encodeCall(ACTEvents.NameUpdated, (name_)));
  }

  // TODO: add sender verification
  function setRegistry(address registry) external {
    if (_getRegistry() == registry) {
      // nothing to do
      return;
    }

    _setRegistry(registry);

    emit RegistryUpdated(registry);

    _triggerRegistryEvent(
      abi.encodeCall(ACTEvents.RegistryUpdated, (registry))
    );
  }

  // TODO: add sender verification
  function setMaintainer(address maintainer) external {
    if (_getMaintainer() == maintainer) {
      // nothing to do
      return;
    }

    _setMaintainer(maintainer);

    emit MaintainerUpdated(maintainer);

    _triggerRegistryEvent(
      abi.encodeCall(ACTEvents.MaintainerUpdated, (maintainer))
    );
  }

  // TODO: add sender verification
  function setSystem(ACTSystems system) external {
    if (_getSystem() == system) {
      // nothing to do
      return;
    }

    _setSystem(system);

    emit SystemUpdated(system);

    _triggerRegistryEvent(abi.encodeCall(ACTEvents.SystemUpdated, (system)));
  }

  // TODO: add sender verification
  function setAsReady() external {
    require(!_isReady(), AlreadyInReadyState());

    _setAsReady();

    emit BecameReady();

    _triggerRegistryEvent(abi.encodeCall(ACTEvents.BecameReady, ()));
  }

  // internal getters

  function _getOwner() internal view returns (address _result) {
    return
      _getSystem() == ACTSystems.AbsoluteMonarchy
        ? _getMaintainer()
        : address(this);
  }

  // internal setters

  function _triggerRegistryEvent(bytes memory data) internal {
    address registry = _getRegistry();

    if (registry != address(0)) {
      ACTRegistry(registry).emitTokenEvent(data);
    }
  }
}
