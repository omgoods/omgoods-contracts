// SPDX-License-Identifier: None
pragma solidity 0.8.21;

import {Ownable} from "../access/Ownable.sol";
import {Initializable} from "../utils/Initializable.sol";
import {TokenFactory} from "./TokenFactory.sol";

abstract contract TokenImpl is Ownable, Initializable {
  // storage

  address internal _tokenFactory;

  string private _name;

  string private _symbol;

  // deployment

  constructor() Ownable(address(0)) {
    _initialized = true;
  }

  function _initialize(address gateway) internal initializeOnce {
    _gateway = gateway;

    _tokenFactory = msg.sender;
  }

  function _initialize(
    address gateway,
    string calldata name_,
    string calldata symbol_,
    address owner
  ) internal {
    _initialize(gateway);

    _name = name_;
    _symbol = symbol_;
    _owner = owner;
  }

  // public getters

  function name() public view virtual returns (string memory) {
    return _name;
  }

  function symbol() public view virtual returns (string memory) {
    return _symbol;
  }

  // internal setters

  function _setOwner(address owner) internal virtual override {
    super._setOwner(owner);

    TokenFactory(_tokenFactory).emitTokenOwnerUpdated(owner);
  }
}
