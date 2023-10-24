// SPDX-License-Identifier: None
pragma solidity 0.8.21;

import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";
import {Guarded} from "../../access/Guarded.sol";

contract TokenRegistry is EIP712, Guarded {
  bytes32 private constant TOKEN_TYPEHASH =
    keccak256("Token(address tokenImpl,bytes32 salt,bytes initCode)");

  // storage

  mapping(address => bool) internal _tokens;

  mapping(address => bool) internal _tokenFactories;

  // events

  event TokenCreated(address token, address tokenImpl, bytes initCode);

  event TokenAdded(address token);

  event TokenFactoryAdded(address tokenFactory);

  event TokenFactoryRemoved(address tokenFactory);

  event TokenEvent(address token, uint8 kind, bytes encoded);

  // errors

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

  constructor(address owner, string memory name) EIP712(name, "1") {
    _setInitialOwner(owner);
  }

  // external getters

  function hashToken(
    address tokenImpl,
    bytes32 salt,
    bytes calldata initCode
  ) external view returns (bytes32) {
    return _hashToken(tokenImpl, salt, initCode);
  }

  function hasToken(address token) external view returns (bool) {
    return _tokens[token];
  }

  function hasTokenFactory(address tokenFactory) external view returns (bool) {
    return _tokenFactories[tokenFactory];
  }

  // external setters

  function createToken(
    address tokenImpl,
    bytes32 salt,
    bytes calldata initCode
  ) external onlyTokenFactory {
    _createToken(tokenImpl, salt, initCode);
  }

  function createToken(
    address tokenImpl,
    bytes32 salt,
    bytes calldata initCode,
    bytes calldata guardianSignature
  ) external onlyTokenFactory {
    _verifyGuardianSignature(
      _hashToken(tokenImpl, salt, initCode),
      guardianSignature
    );

    _createToken(tokenImpl, salt, initCode);
  }

  function addToken(address token) external onlyOwner {
    if (_tokens[token]) {
      revert TokenAlreadyExists();
    }

    _tokens[token] = true;

    emit TokenAdded(token);
  }

  function addTokenFactory(address tokenFactory) external onlyOwner {
    if (_tokenFactories[tokenFactory]) {
      revert TokenFactoryAlreadyExists();
    }

    _tokenFactories[tokenFactory] = true;

    emit TokenFactoryAdded(tokenFactory);
  }

  function removeTokenFactory(address tokenFactory) external onlyOwner {
    if (!_tokenFactories[tokenFactory]) {
      revert TokenFactoryDoesntExist();
    }

    _tokenFactories[tokenFactory] = false;

    emit TokenFactoryRemoved(tokenFactory);
  }

  function emitTokenEvent(
    uint8 kind,
    bytes calldata encoded
  ) external onlyToken {
    emit TokenEvent(msg.sender, kind, encoded);
  }

  // private getters

  function _hashToken(
    address tokenImpl,
    bytes32 salt,
    bytes calldata initCode
  ) private view returns (bytes32) {
    return
      _hashTypedDataV4(
        keccak256(
          abi.encode(
            TOKEN_TYPEHASH,
            keccak256(abi.encodePacked(tokenImpl)),
            salt,
            keccak256(initCode)
          )
        )
      );
  }

  // private setters

  function _createToken(
    address tokenImpl,
    bytes32 salt,
    bytes calldata initCode
  ) private {
    address token = Clones.cloneDeterministic(tokenImpl, salt);

    _tokens[token] = true;

    emit TokenCreated(token, tokenImpl, initCode);

    // solhint-disable-next-line avoid-low-level-calls
    (bool success, bytes memory response) = token.call(initCode);

    if (!success) {
      // solhint-disable-next-line no-inline-assembly
      assembly {
        revert(add(response, 32), mload(response))
      }
    }
  }
}
