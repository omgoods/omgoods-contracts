// SPDX-License-Identifier: None
pragma solidity 0.8.27;

import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {Guarded} from "../access/Guarded.sol";
import {CloneFactory} from "../proxy/CloneFactory.sol";
import {Initializable} from "../utils/Initializable.sol";

contract TokenFactory is EIP712, Guarded, CloneFactory, Initializable {
  using ECDSA for bytes32;

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

  event TokenNotificationSent(
    address token,
    uint8 kind,
    bytes encodedData,
    uint256 timestamp
  );

  // errors

  error MsgSenderIsNotTheToken();

  error InvalidGuardianSignature();

  // modifiers

  modifier onlyToken() {
    if (_tokenSalts[msg.sender] == bytes32(0)) {
      revert MsgSenderIsNotTheToken();
    }

    _;
  }

  // deployment

  constructor(
    string memory eip712Name,
    address owner,
    address target
  ) EIP712(eip712Name, "1") CloneFactory(target) {
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

  function hashToken(
    TokenData calldata tokenData
  ) external view returns (bytes32) {
    return _hashToken(tokenData.salt, tokenData.impl, tokenData.initData);
  }

  // external setters

  function createToken(
    bytes32 salt,
    address impl,
    bytes memory initData
  ) external onlyOwner {
    _createToken(salt, impl, initData);
  }

  function createToken(
    bytes32 salt,
    address impl,
    bytes memory initData,
    bytes memory signature
  ) external {
    bytes32 hash = _hashToken(salt, impl, initData);
    address signer = hash.recover(signature);

    if (!_isGuardian(signer)) {
      revert InvalidGuardianSignature();
    }

    _createToken(salt, impl, initData);
  }

  function sendTokenNotification(
    uint8 kind,
    bytes calldata encodedData
  ) external onlyToken {
    emit TokenNotificationSent(msg.sender, kind, encodedData, block.timestamp);
  }

  // internal getters

  function _hashToken(
    bytes32 salt,
    address impl,
    bytes memory initData
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

  // internal setters

  function _createToken(
    bytes32 salt,
    address impl,
    bytes memory initData
  ) internal {
    address token = _createClone(salt, impl, initData);

    _tokenSalts[token] = salt;

    emit TokenCreated(token, impl, initData, block.timestamp);
  }
}
