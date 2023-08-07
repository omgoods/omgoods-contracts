// SPDX-License-Identifier: NONE
pragma solidity 0.8.20;

import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {Context} from "@openzeppelin/contracts/utils/Context.sol";
import {Ownable} from "../common/access/Ownable.sol";
import {ProxyHelper} from "../common/proxy/ProxyHelper.sol";
import {Initializable} from "../common/utils/Initializable.sol";
import {GatewayRecipient} from "../gateway/GatewayRecipient.sol";
import {TokenRegistry} from "./TokenRegistry.sol";

abstract contract TokenFactory is
  EIP712,
  Ownable,
  Initializable,
  GatewayRecipient
{
  // storage

  address internal _tokenRegistry;

  address internal _tokenImplementation;

  // errors

  error TokenRegistryIsTheZeroAddress();

  error TokenImplementationIsTheZeroAddress();

  error TokenOwnerIsTheZeroAddress();

  // deployment functions

  constructor(
    address owner,
    string memory name,
    string memory version
  ) EIP712(name, version) Ownable(owner) {
    //
  }

  function _initialize(
    address gateway,
    address tokenRegistry,
    address tokenImplementation
  ) internal onlyOwner initializeOnce {
    if (tokenRegistry == address(0)) {
      revert TokenRegistryIsTheZeroAddress();
    }

    if (tokenImplementation == address(0)) {
      revert TokenImplementationIsTheZeroAddress();
    }

    _gateway = gateway;
    _tokenRegistry = tokenRegistry;
    _tokenImplementation = tokenImplementation;
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

  function _msgData()
    internal
    view
    virtual
    override(Context, GatewayRecipient)
    returns (bytes calldata)
  {
    return GatewayRecipient._msgData();
  }

  function _computeToken(bytes32 tokenSalt) internal view returns (address) {
    return
      ProxyHelper.computeProxy(_tokenRegistry, _tokenImplementation, tokenSalt);
  }

  // internal functions (setters)

  function _createToken(
    bytes32 salt,
    bytes32 initHash,
    bytes calldata guardianSignature
  ) internal returns (address) {
    return
      TokenRegistry(_tokenRegistry).createToken(
        _tokenImplementation,
        salt,
        initHash,
        guardianSignature
      );
  }
}
