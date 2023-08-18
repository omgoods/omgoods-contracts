// SPDX-License-Identifier: None
pragma solidity 0.8.21;

import {Context} from "@openzeppelin/contracts/utils/Context.sol";
import {Ownable} from "../common/access/Ownable.sol";
import {Initializable} from "../common/utils/Initializable.sol";
import {GatewayRecipient} from "../gateway/GatewayRecipient.sol";
import {TokenRegistry} from "./TokenRegistry.sol";

abstract contract Token is Ownable, Initializable, GatewayRecipient {
  // storage

  address internal _tokenRegistry;

  // errors

  error TokenRegistryIsTheZeroAddress();

  // deployment

  constructor(address owner) Ownable(owner) {
    //
  }

  function _initialize(
    address gateway,
    address tokenRegistry
  ) internal initializeOnce {
    if (tokenRegistry == address(0)) {
      revert TokenRegistryIsTheZeroAddress();
    }

    _gateway = gateway;
    _tokenRegistry = tokenRegistry;
  }

  // external getters

  function getTokenRegistry() external view returns (address) {
    return _tokenRegistry;
  }

  // internal getters

  function _msgSender()
    internal
    view
    virtual
    override(Context, GatewayRecipient)
    returns (address)
  {
    return GatewayRecipient._msgSender();
  }

  // internal setters

  function _afterOwnerUpdated(address owner) internal override {
    super._afterOwnerUpdated(owner);

    TokenRegistry(_tokenRegistry).emitTokenOwnerUpdated(owner);
  }
}
