// SPDX-License-Identifier: None
pragma solidity 0.8.21;

import {Guarded} from "../common/access/Guarded.sol";
import {ProxyFactory} from "../common/proxy/ProxyFactory.sol";
import {Initializable} from "../common/utils/Initializable.sol";

abstract contract TokenRegistry is Guarded, ProxyFactory, Initializable {
  // storage

  mapping(address => bool) internal _tokens;

  mapping(address => bool) internal _tokenFactories;

  // events

  event Initialized(address[] guardians);

  event TokenAdded(address token);

  event TokenCreated(address token, address tokenFactory);

  event TokenFactoryAdded(address tokenFactory);

  event TokenFactoryRemoved(address tokenFactory);

  event TokenOwnerUpdated(address token, address owner);

  // errors

  error TokenIsTheZeroAddress();

  error TokenFactoryIsTheZeroAddress();

  error TokenAlreadyExists();

  error TokenFactoryAlreadyExists();

  error TokenFactoryDoesntExist();

  error MsgSenderIsNotTheToken();

  error MsgSenderIsNotTheTokenFactory();

  // modifiers

  modifier onlyToken() {
    if (!_tokens[msg.sender]) {
      revert MsgSenderIsNotTheToken();
    }

    _;
  }

  modifier onlyTokenFactory() {
    if (!_tokenFactories[msg.sender]) {
      revert MsgSenderIsNotTheTokenFactory();
    }

    _;
  }

  // deployment

  constructor(address owner) Guarded(owner) {
    //
  }

  function initialize(
    address[] calldata guardians
  ) external onlyOwner initializeOnce {
    _addGuardians(guardians);

    emit Initialized(guardians);
  }

  // external getters

  function hasToken(address token) external view returns (bool) {
    return _tokens[token];
  }

  function hasTokenFactory(address tokenFactory) external view returns (bool) {
    return _tokenFactories[tokenFactory];
  }

  // external setters

  function addToken(address token) external onlyOwner {
    if (token == address(0)) {
      revert TokenIsTheZeroAddress();
    }

    if (_tokens[token]) {
      revert TokenAlreadyExists();
    }

    _tokens[token] = true;

    emit TokenAdded(token);
  }

  function createToken(
    address tokenImpl,
    bytes32 salt,
    bytes32 initHash,
    bytes calldata guardianSignature
  ) external onlyTokenFactory returns (address token) {
    _verifyGuardianSignature(initHash, guardianSignature);

    token = _createProxy(tokenImpl, salt);

    if (token == address(0)) {
      revert TokenAlreadyExists();
    }

    _tokens[token] = true;

    emit TokenCreated(token, msg.sender);

    return token;
  }

  function addTokenFactory(address tokenFactory) external onlyOwner {
    if (tokenFactory == address(0)) {
      revert TokenFactoryIsTheZeroAddress();
    }

    if (_tokenFactories[tokenFactory]) {
      revert TokenFactoryAlreadyExists();
    }

    _tokenFactories[tokenFactory] = true;

    emit TokenFactoryAdded(tokenFactory);
  }

  function removeTokenFactory(address tokenFactory) external onlyOwner {
    if (tokenFactory == address(0)) {
      revert TokenFactoryIsTheZeroAddress();
    }

    if (!_tokenFactories[tokenFactory]) {
      revert TokenFactoryDoesntExist();
    }

    _tokenFactories[tokenFactory] = false;

    emit TokenFactoryRemoved(tokenFactory);
  }

  function emitTokenOwnerUpdated(address owner) external onlyToken {
    emit TokenOwnerUpdated(msg.sender, owner);
  }
}
