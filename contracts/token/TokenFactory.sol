// SPDX-License-Identifier: NONE
pragma solidity 0.8.20;

import {Context} from "@openzeppelin/contracts/utils/Context.sol";
import {Ownable} from "../common/access/Ownable.sol";
import {ProxyHelper} from "../common/proxy/ProxyHelper.sol";
import {Initializable} from "../common/utils/Initializable.sol";
import {GatewayRecipient} from "../gateway/GatewayRecipient.sol";
import {TokenRegistry} from "./TokenRegistry.sol";

abstract contract TokenFactory is Ownable, Initializable, GatewayRecipient {
  // storage

  address internal _tokenRegistry;

  address internal _tokenImpl;

  // errors

  error TokenRegistryIsTheZeroAddress();

  error TokenImplIsTheZeroAddress();

  error TokenOwnerIsTheZeroAddress();

  // deployment functions

  constructor(address owner) Ownable(owner) {
    //
  }

  function _initialize(
    address gateway,
    address tokenRegistry,
    address tokenImpl
  ) internal onlyOwner initializeOnce {
    if (tokenRegistry == address(0)) {
      revert TokenRegistryIsTheZeroAddress();
    }

    if (tokenImpl == address(0)) {
      revert TokenImplIsTheZeroAddress();
    }

    _gateway = gateway;
    _tokenRegistry = tokenRegistry;
    _tokenImpl = tokenImpl;
  }

  // internal functions (getters)

  function _msgSender()
    internal
    view
    virtual
    override(Context, GatewayRecipient)
    returns (address)
  {
    return GatewayRecipient._msgSender();
  }

  function _computeToken(bytes32 tokenSalt) internal view returns (address) {
    return ProxyHelper.computeProxy(_tokenRegistry, _tokenImpl, tokenSalt);
  }

  // internal functions (setters)

  function _createToken(
    bytes32 salt,
    bytes32 initHash,
    bytes calldata guardianSignature
  ) internal returns (address) {
    return
      TokenRegistry(_tokenRegistry).createToken(
        _tokenImpl,
        salt,
        initHash,
        guardianSignature
      );
  }
}
