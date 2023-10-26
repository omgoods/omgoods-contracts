// SPDX-License-Identifier: None
pragma solidity 0.8.21;

import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";
import {Guarded} from "../access/Guarded.sol";
import {Initializable} from "../utils/Initializable.sol";

contract TokenRegistry is EIP712, Guarded, Initializable {
  using ECDSA for bytes32;

  struct TokenData {
    address tokenImpl;
    bytes initCode;
  }

  bytes32 private constant TOKEN_TYPEHASH =
    keccak256(
      "Token(address tokenImpl,bytes initCode)" //
    );

  // storage

  mapping(address => bool) internal _tokens;

  mapping(address => bool) internal _tokenFactories;

  // events

  event Initialized(address gateway, address[] guardians);

  event TokenCreated(address token, address tokenImpl, bytes initCode);

  event TokenAdded(address token);

  event TokenFactoryAdded(address tokenFactory);

  event TokenFactoryRemoved(address tokenFactory);

  event TokenNotificationSent(address token, uint8 kind, bytes encodedData);

  // errors

  error TokenIsTheZeroAddress();

  error TokenAlreadyExists();

  error TokenFactoryIsTheZeroAddress();

  error TokenFactoryAlreadyExists();

  error TokenFactoryDoesntExist();

  error MsgSenderIsNotTheToken();

  error MsgSenderIsNotTheTokenFactory();

  error InvalidGuardianSignature();

  // modifiers

  modifier onlyToken() {
    _checkToken();

    _;
  }

  modifier onlyTokenFactory() {
    _checkTokenFactory();

    _;
  }

  // deployment

  constructor(address owner, string memory name) EIP712(name, "1") {
    _setInitialOwner(owner);
  }

  function initialize(
    address gateway,
    address[] calldata guardians
  ) external initializeOnce onlyOwner {
    _gateway = gateway;

    _setInitialGuardians(guardians);

    emit Initialized(gateway, guardians);
  }

  // external getters

  function hashToken(
    TokenData calldata tokenData
  ) external view returns (bytes32) {
    return _hashToken(tokenData.tokenImpl, tokenData.initCode);
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
  ) external {
    _createToken(tokenImpl, salt, initCode);
  }

  function createToken(
    address tokenImpl,
    bytes32 salt,
    bytes calldata initCode,
    bytes calldata guardianSignature
  ) external {
    if (
      !_hasGuardian(_hashToken(tokenImpl, initCode).recover(guardianSignature))
    ) {
      revert InvalidGuardianSignature();
    }

    _createToken(tokenImpl, salt, initCode);
  }

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

  function sendTokenNotification(
    uint8 kind,
    bytes calldata encodedData
  ) external onlyToken {
    emit TokenNotificationSent(msg.sender, kind, encodedData);
  }

  // private getters

  function _checkToken() private view {
    if (!_tokens[msg.sender]) {
      revert MsgSenderIsNotTheToken();
    }
  }

  function _checkTokenFactory() private view {
    if (!_tokenFactories[msg.sender]) {
      revert MsgSenderIsNotTheTokenFactory();
    }
  }

  function _hashToken(
    address tokenImpl,
    bytes calldata initCode
  ) private view returns (bytes32) {
    return
      _hashTypedDataV4(
        keccak256(
          abi.encode(
            TOKEN_TYPEHASH, //
            tokenImpl,
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
  ) private onlyTokenFactory {
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
