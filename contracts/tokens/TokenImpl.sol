// SPDX-License-Identifier: None
pragma solidity 0.8.27;

import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {Ownable} from "../access/Ownable.sol";
import {CloneImpl} from "../proxy/CloneImpl.sol";
import {TokenFactory} from "./TokenFactory.sol";

abstract contract TokenImpl is EIP712, Ownable, CloneImpl {
  // storage

  address private _controller;

  bool private _ready;

  // events

  error TokenAlreadyReady();

  error TokenNotReady();

  error MsgSenderIsNotTheController();

  // modifiers

  modifier onlyCurrentManager() {
    _requireOnlyCurrentManager();

    _;
  }
  // modifiers

  modifier onlyReadyOrAnyManager() {
    _onlyReadyOrAnyManager();

    _;
  }

  // deployment

  constructor(string memory eip712Name) EIP712(eip712Name, "1") CloneImpl() {
    //
  }

  // external getters

  function getController() external view returns (address) {
    return _getController();
  }

  function isReady() external view returns (bool) {
    return _isReady();
  }

  // external setters

  function setReady() external onlyOwner {
    require(!_isReady(), TokenAlreadyReady());

    _setReady(true);
    _onceReady();
  }

  // internal getters

  function _getController() internal view returns (address) {
    return _controller;
  }

  function _isReady() internal view returns (bool) {
    return _ready;
  }

  function _hashInitialization(
    bytes32 structHash
  ) internal view virtual returns (bytes32 result) {
    if (_getFactory() == address(0)) {
      result = _hashTypedDataV4(structHash);
    }

    return result;
  }

  function _requireOnlyCurrentManager() internal view {
    address msgSender = _msgSender();

    if (!_isReady()) {
      _requireOnlyOwner(msgSender);
    } else {
      require(msgSender == _getController(), MsgSenderIsNotTheController());
    }
  }

  function _onlyReadyOrAnyManager() internal view {
    if (!_isReady()) {
      address msgSender = _msgSender();

      require(
        msgSender == _getController() || msgSender == _getOwner(),
        TokenNotReady()
      );
    }
  }

  // internal setters

  function _setController(address controller) internal {
    _controller = controller;
  }

  function _setReady(bool ready) internal {
    _ready = ready;
  }

  function _onceReady() internal {
    _notifyTokenFactory(0x00);
  }

  function _notifyTokenFactory(uint8 kind) internal {
    TokenFactory(_getFactory()).sendTokenNotification(kind, new bytes(0));
  }

  function _notifyTokenFactory(uint8 kind, bytes memory encodedData) internal {
    TokenFactory(_getFactory()).sendTokenNotification(kind, encodedData);
  }

  function _afterOwnerUpdated(address owner) internal override {
    super._afterOwnerUpdated(owner);

    _notifyTokenFactory(0x01, abi.encode(owner));
  }
}
