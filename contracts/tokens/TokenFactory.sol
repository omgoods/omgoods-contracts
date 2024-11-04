// SPDX-License-Identifier: None
pragma solidity 0.8.27;

import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {Guarded} from "../access/Guarded.sol";
import {CloneFactory} from "../proxy/CloneFactory.sol";
import {Initializable} from "../utils/Initializable.sol";

contract TokenFactory is EIP712, Guarded, CloneFactory, Initializable {
  struct TokenData {
    bytes32 salt;
    address impl;
    bytes initData;
  }

  bytes32 private constant TOKEN_TYPEHASH =
    keccak256(
      "Token(bytes32 salt,address impl,bytes initData)" //
    );

  // storage

  mapping(address => bytes32) private _tokenSalts;

  // events

  event Initialized(address forwarder, address[] guardians);

  event TokenCreated(
    address token,
    address impl,
    bytes initData,
    uint256 timestamp
  );

  event TokenNotification(
    address token,
    uint8 kind,
    bytes encodedData,
    uint256 timestamp
  );

  // errors

  error MsgSenderIsNotTheToken();

  // modifiers

  modifier onlyToken() {
    _requireOnlyToken();

    _;
  }

  // deployment

  constructor(
    string memory eip712Name,
    address owner,
    address cloneTarget
  ) EIP712(eip712Name, "1") CloneFactory(cloneTarget) {
    _setInitialOwner(owner);
  }

  function initialize(
    address forwarder,
    address[] calldata guardians
  ) external onlyOwner initializeOnce {
    _setForwarder(forwarder);
    _setInitialGuardians(guardians);

    emit Initialized(forwarder, guardians);
  }

  // external getters

  function computeToken(bytes32 salt) external view returns (address) {
    return _computeClone(salt);
  }

  function isToken(address token) external view returns (bool) {
    return _isToken(token);
  }

  function hashToken(
    TokenData calldata tokenData
  ) external view returns (bytes32) {
    return _hashToken(tokenData.salt, tokenData.impl, tokenData.initData);
  }

  // external setters

  function createToken(
    bytes32 salt,
    address impl,
    bytes calldata initData
  ) external onlyOwner {
    _createToken(salt, impl, initData);
  }

  function createToken(
    bytes32 salt,
    address impl,
    bytes calldata initData,
    bytes calldata signature
  ) external {
    bytes32 hash = _hashToken(salt, impl, initData);

    _verifyGuardianSignature(hash, signature);

    _createToken(salt, impl, initData);
  }

  function emitTokenNotification(
    uint8 kind,
    bytes calldata encodedData
  ) external onlyToken {
    _emitTokenNotification(msg.sender, kind, encodedData, block.timestamp);
  }

  // private getters

  function _isToken(address token) private view returns (bool) {
    return _tokenSalts[token] != bytes32(0);
  }

  function _hashToken(
    bytes32 salt,
    address impl,
    bytes calldata initData
  ) private view returns (bytes32) {
    return
      _hashTypedDataV4(
        keccak256(
          abi.encode(
            TOKEN_TYPEHASH, //
            salt,
            impl,
            keccak256(initData)
          )
        )
      );
  }

  function _requireOnlyToken() private view {
    require(_isToken(msg.sender), MsgSenderIsNotTheToken());
  }

  // private setters

  function _createToken(
    bytes32 salt,
    address impl,
    bytes calldata initData
  ) private {
    address token = _createClone(salt, impl, initData);

    _tokenSalts[token] = salt;

    emit TokenCreated(token, impl, initData, block.timestamp);
  }

  function _emitTokenNotification(
    address token,
    uint8 kind,
    bytes calldata encodedData,
    uint256 timestamp
  ) private {
    emit TokenNotification(token, kind, encodedData, timestamp);
  }
}
