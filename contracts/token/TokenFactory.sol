// SPDX-License-Identifier: None
pragma solidity 0.8.21;

import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";
import {Guarded} from "../access/Guarded.sol";
import {Initializable} from "../utils/Initializable.sol";

abstract contract TokenFactory is EIP712, Guarded, Initializable {
  // storage

  address private _tokenImpl;

  mapping(address => bool) internal _tokens;

  // events

  event Initialized(address gateway, address[] guardians, address tokenImpl);

  event TokenOwnerUpdated(address token, address owner);

  // errors

  error MsgSenderIsNotTheToken();

  error TokenImplIsTheZeroAddress();

  // modifiers

  modifier onlyToken() {
    if (!_tokens[msg.sender]) {
      revert MsgSenderIsNotTheToken();
    }

    _;
  }

  // deployment

  constructor(
    address owner,
    string memory name,
    string memory version
  ) Guarded(owner) EIP712(name, version) {
    //
  }

  function initialize(
    address gateway,
    address[] calldata guardians,
    address tokenImpl
  ) external initializeOnce onlyOwner {
    if (tokenImpl == address(0)) {
      revert TokenImplIsTheZeroAddress();
    }

    _gateway = gateway;

    _addGuardians(guardians);

    _tokenImpl = tokenImpl;

    emit Initialized(gateway, guardians, tokenImpl);
  }

  // external getters

  function hasToken(address token) external view returns (bool) {
    return _tokens[token];
  }

  // external setters

  function emitTokenOwnerUpdated(address owner) external onlyToken {
    emit TokenOwnerUpdated(msg.sender, owner);
  }

  // internal getters

  function _computeToken(bytes32 salt) internal view returns (address) {
    return Clones.predictDeterministicAddress(_tokenImpl, salt);
  }

  function _verifyGuardianSignature(
    bytes32 hash,
    bytes calldata signature
  ) internal view override {
    if (_msgSender() != _owner) {
      super._verifyGuardianSignature(hash, signature);
    }
  }

  // internal setters

  function _createToken(bytes32 salt) internal returns (address token) {
    token = Clones.cloneDeterministic(_tokenImpl, salt);

    _tokens[token] = true;

    return token;
  }
}
