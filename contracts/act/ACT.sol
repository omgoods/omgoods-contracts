// SPDX-License-Identifier: None
pragma solidity 0.8.28;

import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {ITokenMetadata} from "../interfaces/ITokenMetadata.sol";
import {ForwarderContext} from "../metatx/ForwarderContext.sol";
import {Delegatable} from "../utils/Delegatable.sol";
import {ACTKinds} from "./enums/ACTKinds.sol";
import {ACTSystems} from "./enums/ACTSystems.sol";
import {IACT} from "./interfaces/IACT.sol";
import {IACTRegistry} from "./interfaces/IACTRegistry.sol";
import {ACTSettings} from "./structs/ACTSettings.sol";
import {ACTEvents} from "./ACTEvents.sol";
import {ACTStorage} from "./ACTStorage.sol";

abstract contract ACT is
  ITokenMetadata,
  ForwarderContext,
  Delegatable,
  IACT,
  ACTStorage
{
  using ECDSA for bytes32;

  // errors

  error AlreadyInitialized();

  error AlreadyInReadyState();

  error MsgSenderIsNotTheOwner(address msgSender);

  error MsgSenderIsNotTheAuthority(address msgSender);

  // events

  event NameUpdated(string name);

  event RegistryUpdated(address registry);

  event MaintainerUpdated(address maintainer);

  event SystemUpdated(ACTSystems system);

  event BecameReady();

  // modifiers

  modifier onlyOwnerOrModule() {
    _;
  }

  // deployment

  function initialize(
    address forwarder,
    string calldata name_,
    string calldata symbol_,
    address maintainer,
    bool ready,
    uint128 epochLength,
    uint128 initialEpoch
  ) external {
    require(_getRegistry() == address(0), AlreadyInitialized());

    _setForwarder(forwarder);
    _setName(name_);
    _setSymbol(symbol_);
    _setRegistry(msg.sender);

    ACTSettings storage settings = _getSettings();

    if (maintainer == address(0) || maintainer == address(this)) {
      settings.system = uint8(ACTSystems.Democracy);
    } else {
      settings.system = uint8(ACTSystems.AbsoluteMonarchy);
      _setMaintainer(maintainer);
    }

    if (ready) {
      settings.ready = true;
    }

    settings.initialEpoch = initialEpoch;
    settings.epochLength = epochLength;
  }

  // external getters

  function kind() external pure virtual returns (ACTKinds) {
    return ACTKinds.Unknown;
  }

  function getSettings() external pure returns (ACTSettings memory) {
    return _getSettings();
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

  function getMaintainer() external view returns (address) {
    return _getMaintainer();
  }

  function getOwner() external view returns (address) {
    return _getOwner();
  }

  // external setters

  // TODO: add sender verification
  function setName(string calldata name_) external {
    _setName(name_);

    emit NameUpdated(name_);

    _triggerRegistryEvent(abi.encodeCall(ACTEvents.NameUpdated, (name_)));
  }

  function setRegistry(address registry) external {
    // TODO: add sender verification

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

  function setMaintainer(address maintainer) external {
    // TODO: add sender verification

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

  function setSystem(ACTSystems system) external {
    ACTSettings storage settings = _getSettings();

    // TODO: add sender verification

    if (ACTSystems(settings.system) == system) {
      // nothing to do
      return;
    }

    settings.system = uint8(system);

    emit SystemUpdated(system);

    _triggerRegistryEvent(abi.encodeCall(ACTEvents.SystemUpdated, (system)));
  }

  function setAsReady() external {
    ACTSettings storage settings = _getSettings();

    // TODO: add sender verification

    require(!settings.ready, AlreadyInReadyState());

    settings.ready = true;

    emit BecameReady();

    _triggerRegistryEvent(abi.encodeCall(ACTEvents.BecameReady, ()));
  }

  // internal getters

  function _getForwarder()
    internal
    view
    override(ForwarderContext, ACTStorage)
    returns (address)
  {
    return ACTStorage._getForwarder();
  }

  function _getOwner() internal view returns (address) {
    return _getOwner(_getSettings());
  }

  function _getOwner(
    ACTSettings memory settings
  ) internal view returns (address) {
    return
      ACTSystems(settings.system) == ACTSystems.AbsoluteMonarchy
        ? _getMaintainer()
        : address(this);
  }

  // internal setters

  function _setForwarder(
    address forwarder
  ) internal override(ForwarderContext, ACTStorage) {
    ACTStorage._setForwarder(forwarder);
  }

  function _triggerRegistryEvent(bytes memory data) internal {
    address registry = _getRegistry();

    if (registry != address(0)) {
      IACTRegistry(registry).emitTokenEvent(data);
    }
  }
}
