// SPDX-License-Identifier: None
pragma solidity 0.8.28;

import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {ForwarderContext} from "../metatx/ForwarderContext.sol";
import {Delegatable} from "../utils/Delegatable.sol";
import {Initializable} from "../utils/Initializable.sol";
import {ACTEvents} from "./ACTEvents.sol";
import {ACTRegistry} from "./ACTRegistry.sol";
import {ACTStorage} from "./ACTStorage.sol";

abstract contract ACT is
  ForwarderContext,
  Delegatable,
  Initializable,
  ACTStorage
{
  using ECDSA for bytes32;

  // epoch length

  /**
   * @dev Enumeration to represent the different types of "Kinds" supported by the contract.
   * `Unknown` (0) - Represents an undefined or default kind.
   * `Fungible` (1) - Represents a fungible kind, typically associated with tokens such as ERC20.
   * `NonFungible` (2) - Represents a non-fungible kind, typically associated with unique assets like ERC721.
   */
  enum Kinds {
    Unknown, // 0
    Fungible, // 1
    NonFungible // 2
  }

  // storage

  mapping(address extension => bool enabled) private _enabledExtensions;

  mapping(address module => bool enabled) private _enabledModules;

  // errors

  error InvalidRegistry(address registry);

  error AlreadyInReadyState();

  error InvalidOwner(address owner);

  error InvalidExtension(address extension);

  error InvalidModule(address module);

  error MsgSenderIsNotTheOwner(address msgSender);

  error MsgSenderIsNotTheAuthority(address msgSender);

  // events

  event Received(address sender, uint256 value);

  event RegistryUpdated(address registry);

  event BecameReady();

  event OwnerUpdated(address registry);

  event NameUpdated(string name);

  event ExtensionEnabled(address extension);

  event ExtensionDisabled(address extension);

  event ModuleEnabled(address module);

  event ModuleDisabled(address module);

  // modifiers

  modifier onlyOwner() {
    _requireOnlyOwner(_msgSender());

    _;
  }

  modifier onlyAuthority() {
    _requireOnlyAuthority(_msgSender());

    _;
  }

  modifier whenReadyWithExceptions() {
    _requireWhenReadyWithExceptions(_msgSender());

    _;
  }

  // deployment

  constructor() {
    _setInitialized(true);
  }

  function initialize(
    address forwarder,
    address owner,
    bool ready,
    string calldata name_,
    string calldata symbol_
  ) external initializeOnce {
    _setRegistry(msg.sender);
    _setForwarder(forwarder);

    if (owner == address(0) || owner == address(this)) {
      _setSystem(Systems.Democracy);
      _setOwner(address(this));
    } else {
      _setSystem(Systems.AbsoluteMonarchy);
      _setOwner(owner);
    }

    if (ready) {
      _setAsReady();
    }

    _setName(name_);
    _setSymbol(symbol_);
  }

  // receive

  receive() external payable {
    emit Received(msg.sender, msg.value);

    _triggerRegistryEvent(
      abi.encodeCall(ACTEvents.received, (msg.sender, msg.value))
    );
  }

  // external getters

  function getRegistry() external view returns (address) {
    return _getRegistrySlot().value;
  }

  function getSystem() external view returns (Systems) {
    return _getSystem();
  }

  function isReady() external view returns (bool) {
    return _isReady();
  }

  function getOwner() external view returns (address) {
    return _getOwner();
  }

  function getAuthority() external view returns (address) {
    return _getAuthority();
  }

  function kind() external pure virtual returns (Kinds) {
    return Kinds.Unknown;
  }

  function name() external view returns (string memory) {
    return _getName();
  }

  function symbol() external view returns (string memory) {
    return _getSymbol();
  }

  function hasExtensionEnabled(address extension) external view returns (bool) {
    return _hasExtensionEnabled(extension);
  }

  function hasModuleEnabled(address module) external view returns (bool) {
    return _hasModuleEnabled(module);
  }

  // external setters

  function setRegistry(address registry) external onlyAuthority {
    if (_getRegistry() == registry) {
      // nothing to do
      return;
    }

    require(registry != address(0), InvalidRegistry(address(0)));

    _setRegistry(registry);

    emit RegistryUpdated(registry);

    _triggerRegistryEvent(
      abi.encodeCall(ACTEvents.registryUpdated, (registry))
    );
  }

  function setSystem(Systems system) external onlyAuthority {
    if (_getSystem() == system) {
      // nothing to do
      return;
    }

    _setSystem(system);

    // TODO: emit event
  }

  function setAsReady() external onlyAuthority {
    require(!_isReady(), AlreadyInReadyState());

    _setAsReady();

    emit BecameReady();

    _triggerRegistryEvent(abi.encodeCall(ACTEvents.becameReady, ()));
  }

  function setOwner(address owner) external onlyOwner {
    if (_getOwner() == owner) {
      // nothing to do
      return;
    }

    require(owner != address(0), InvalidOwner(address(0)));

    _setOwner(owner);

    // TODO: emit event
  }

  function enableExtension(address extension) external onlyAuthority {
    if (_hasExtensionEnabled(extension)) {
      // nothing to do
      return;
    }

    require(extension != address(0), InvalidExtension(address(0)));

    _enableExtension(extension);

    // TODO: emit event
  }

  function disableExtension(address extension) external onlyAuthority {
    if (!_hasExtensionEnabled(extension)) {
      // nothing to do
      return;
    }

    _disableExtension(extension);

    // TODO: emit event
  }

  function callExtension(
    address extension,
    bytes calldata data
  ) external onlyAuthority {
    require(_hasExtensionEnabled(extension), InvalidExtension(extension));

    _delegate(extension, data);
  }

  // internal getters

  function _getAuthority() internal view returns (address _result) {
    return
      _getSystem() == Systems.AbsoluteMonarchy ? _getOwner() : address(this);
  }

  function _hasExtensionEnabled(
    address extension
  ) internal view returns (bool) {
    return _enabledExtensions[extension];
  }

  function _hasModuleEnabled(address module) internal view returns (bool) {
    return _enabledModules[module];
  }

  function _requireOnlyOwner(address msgSender) internal view {
    require(_getOwner() == msgSender, MsgSenderIsNotTheOwner(msgSender));
  }

  function _requireOnlyAuthority(address msgSender) internal view {
    require(
      _getAuthority() == msgSender,
      MsgSenderIsNotTheAuthority(msgSender)
    );
  }

  function _requireWhenReadyWithExceptions(address msgSender) internal view {
    if (!_isReady()) {
      _requireOnlyAuthority(msgSender);
    }
  }

  // internal setters

  function _enableExtension(address extension) internal {
    _enabledExtensions[extension] = true;
  }

  function _disableExtension(address extension) internal {
    _enabledExtensions[extension] = false;
  }

  function _triggerRegistryEvent(bytes memory data) internal {
    address registry = _getRegistry();
    if (registry != address(0)) {
      ACTRegistry(registry).emitTokenEvent(data);
    }
  }
}
