// SPDX-License-Identifier: None
pragma solidity 0.8.21;

import {GatewayRecipient} from "../gateway/GatewayRecipient.sol";
import {Initializable} from "../utils/Initializable.sol";

abstract contract TokenImpl is GatewayRecipient, Initializable {
  // storage

  address internal _tokenFactory;

  string internal _name;

  string internal _symbol;

  // deployment

  constructor() {
    _initialized = true;
  }

  function _initialize(address gateway) internal initializeOnce {
    _gateway = gateway;

    _tokenFactory = msg.sender;
  }

  function _initialize(
    address gateway,
    string calldata name_,
    string calldata symbol_
  ) internal {
    _initialize(gateway);

    _name = name_;

    _symbol = symbol_;
  }

  // public getters

  function name() public view virtual returns (string memory) {
    return _name;
  }

  function symbol() public view virtual returns (string memory) {
    return _symbol;
  }
}
