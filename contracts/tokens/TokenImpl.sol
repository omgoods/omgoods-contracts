// SPDX-License-Identifier: None
pragma solidity 0.8.27;

import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {Ownable} from "../access/Ownable.sol";
import {CloneImpl} from "../proxy/CloneImpl.sol";
import {TokenFactory} from "./TokenFactory.sol";

abstract contract TokenImpl is EIP712, Ownable, CloneImpl {
  address private _controller;

  bool private _ready;

  // events

  error TokenAlreadyReady();

  error TokenNotReady();

  error MsgSenderIsNotTheController();

  // modifiers

  modifier onlyManagement() {
    address sender = _msgSender();
    if (!_isReady()) {
      _checkOwner(sender);
    } else if (sender != _getController()) {
      revert MsgSenderIsNotTheController();
    }

    _;
  }
  // modifiers

  modifier onlyReadyOrManagement() {
    if (!_isReady()) {
      address sender = _msgSender();

      if (sender != _getController() && sender != _getOwner()) {
        revert TokenNotReady();
      }
    }

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
    if (_isReady()) {
      revert TokenAlreadyReady();
    }

    _setReady(true, true);
  }

  // internal getters

  function _getController() internal view returns (address) {
    return _controller;
  }

  function _isReady() internal view returns (bool) {
    return _ready;
  }

  // internal setters

  function _setController(address controller) internal {
    _controller = controller;
  }

  function _setReady(bool ready, bool emitEvent) internal {
    _ready = ready;

    if (emitEvent) {
      _notifyTokenRegistry(0x00);
    }
  }

  function _notifyTokenRegistry(uint8 kind) internal {
    TokenFactory(_getFactory()).sendTokenNotification(kind, new bytes(0));
  }

  function _notifyTokenRegistry(uint8 kind, bytes memory encodedData) internal {
    TokenFactory(_getFactory()).sendTokenNotification(kind, encodedData);
  }

  function _setOwner(address owner, bool emitEvent) internal override {
    super._setOwner(owner, emitEvent);

    if (emitEvent) {
      _notifyTokenRegistry(0x01, abi.encode(owner));
    }
  }
}
