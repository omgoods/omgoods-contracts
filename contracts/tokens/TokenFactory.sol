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
    string memory name
  ) Guarded(owner) EIP712(name, "1") {
    //
  }

  function _initialize(
    address gateway,
    address[] calldata guardians,
    address tokenImpl
  ) internal initializeOnce onlyOwner {
    if (tokenImpl == address(0)) {
      revert TokenImplIsTheZeroAddress();
    }

    _gateway = gateway;

    _setGuardians(guardians);

    _tokenImpl = tokenImpl;
  }

  // external getters

  function hasToken(address token) external view returns (bool) {
    return _tokens[token];
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
