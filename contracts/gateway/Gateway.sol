// SPDX-License-Identifier: NONE
pragma solidity 0.8.21;

import {IERC1271} from "@openzeppelin/contracts/interfaces/IERC1271.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";
import {IAccountRegistry} from "../account/IAccountRegistry.sol";
import {Ownable} from "../common/access/Ownable.sol";
import {Bytes} from "../common/utils/Bytes.sol";
import {Initializable} from "../common/utils/Initializable.sol";

contract Gateway is EIP712, Ownable, Initializable {
  using ECDSA for bytes32;
  using Address for address;
  using Bytes for bytes[];

  bytes32 private constant REQUEST_TYPE_HASH =
    keccak256(
      "Request(address from,uint256 nonce,address to,uint256 value,bytes data)"
    );

  bytes32 private constant REQUESTS_TYPE_HASH =
    keccak256(
      "Requests(address from,uint256 nonce,address[] to,uint256[] value,bytes[] data)"
    );

  // storage

  address private _accountRegistry;

  mapping(address => uint256) private _nonce;

  // events

  event Initialized(address accountRegistry);

  event NonceUpdated(address account, uint256 nonce);

  // errors

  error AccountRegistryIsTheZeroAddress();

  error InvalidRequestNonce();

  error RequestFromTheZeroAddress();

  error RequestToTheZeroAddress();

  error RequestToTheInvalidAddress();

  error RequestForbidden();

  error InvalidRequestsBatchSize();

  // deployment

  constructor(
    address owner,
    string memory name,
    string memory version
  ) EIP712(name, version) Ownable(owner) {
    //
  }

  function initialize(
    address accountRegistry
  ) external onlyOwner initializeOnce {
    if (accountRegistry == address(0)) {
      revert AccountRegistryIsTheZeroAddress();
    }

    _accountRegistry = accountRegistry;

    emit Initialized(accountRegistry);
  }

  // external getters

  function getNonce(address account) external view returns (uint256) {
    return _nonce[account];
  }

  function hashRequest(
    address from,
    uint256 nonce,
    address to,
    uint256 value,
    bytes calldata data
  ) external view returns (bytes32) {
    return _hashRequest(from, nonce, to, value, data);
  }

  function hashRequests(
    address from,
    uint256 nonce,
    address[] calldata to,
    uint256[] calldata value,
    bytes[] calldata data
  ) external view returns (bytes32) {
    return _hashRequests(from, nonce, to, value, data);
  }

  function recoverTrustedSigner(
    address account,
    bytes32 hash,
    bytes calldata signature
  ) external view returns (address) {
    return _recoverTrustedSigner(account, hash, signature);
  }

  // external setters

  function sendRequest(
    address to,
    uint256 value,
    bytes calldata data
  ) external {
    _sendRequest(msg.sender, msg.sender, to, value, data);
  }

  function sendRequests(
    address[] calldata to,
    uint256[] calldata value,
    bytes[] calldata data
  ) external {
    _sendRequests(msg.sender, msg.sender, to, value, data);
  }

  function sendRequestFrom(
    address from,
    address to,
    uint256 value,
    bytes calldata data
  ) external {
    _verifyRequest(msg.sender, from);

    _sendRequest(msg.sender, from, to, value, data);
  }

  function sendRequestsFrom(
    address from,
    address[] calldata to,
    uint256[] calldata value,
    bytes[] calldata data
  ) external {
    _verifyRequest(msg.sender, from);

    _sendRequests(msg.sender, from, to, value, data);
  }

  function forwardRequest(
    address from,
    uint256 nonce,
    address to,
    uint256 value,
    bytes calldata data,
    bytes calldata signature
  ) external {
    address signer = _verifyRequest(
      _hashRequest(from, nonce, to, value, data),
      signature,
      from,
      nonce
    );

    _sendRequest(signer, from, to, value, data);
  }

  function forwardRequests(
    address from,
    uint256 nonce,
    address[] calldata to,
    uint256[] calldata value,
    bytes[] calldata data,
    bytes calldata signature
  ) external {
    address signer = _verifyRequest(
      _hashRequests(from, nonce, to, value, data),
      signature,
      from,
      nonce
    );

    _sendRequests(signer, from, to, value, data);
  }

  // private getters

  function _isTrustedSender(
    address account,
    address sender
  ) private view returns (bool) {
    return
      account == sender ||
      IAccountRegistry(_accountRegistry).isAccountOwner(account, sender);
  }

  function _hashRequest(
    address from,
    uint256 nonce,
    address to,
    uint256 value,
    bytes calldata data
  ) private view returns (bytes32) {
    return
      _hashTypedDataV4(
        keccak256(
          abi.encode(REQUEST_TYPE_HASH, from, nonce, to, value, keccak256(data))
        )
      );
  }

  function _hashRequests(
    address from,
    uint256 nonce,
    address[] calldata to,
    uint256[] calldata value,
    bytes[] calldata data
  ) private view returns (bytes32) {
    return
      _hashTypedDataV4(
        keccak256(
          abi.encode(
            REQUESTS_TYPE_HASH,
            from,
            nonce,
            to,
            value,
            data.toKeccak256()
          )
        )
      );
  }

  function _verifyRequest(address sender, address from) private view {
    if (from == address(0)) {
      revert RequestFromTheZeroAddress();
    }

    if (!_isTrustedSender(from, sender)) {
      revert RequestForbidden();
    }
  }

  function _recoverTrustedSigner(
    address account,
    bytes32 hash,
    bytes calldata signature
  ) private view returns (address signer) {
    signer = hash.recover(signature);

    if (!_isTrustedSender(account, signer)) {
      if (
        account.isContract() &&
        IERC1271(account).isValidSignature(hash, signature) ==
        IERC1271(account).isValidSignature.selector
      ) {
        signer = account;
      } else {
        signer = address(0);
      }
    }

    return signer;
  }

  // private setters

  function _verifyRequest(
    bytes32 hash,
    bytes calldata signature,
    address from,
    uint256 nonce
  ) private returns (address signer) {
    if (from == address(0)) {
      revert RequestFromTheZeroAddress();
    }

    unchecked {
      if (_nonce[from]++ != nonce) {
        revert InvalidRequestNonce();
      }
    }

    emit NonceUpdated(from, nonce);

    signer = _recoverTrustedSigner(from, hash, signature);

    if (signer == address(0)) {
      revert RequestForbidden();
    }

    return signer;
  }

  function _sendRequest(
    address sender,
    address from,
    address to,
    uint256 value,
    bytes calldata data
  ) private {
    if (to == address(0)) {
      revert RequestToTheZeroAddress();
    }

    if (to == address(this)) {
      revert RequestToTheInvalidAddress();
    }

    address contextMsgSender = to == _accountRegistry ? sender : from;

    (bool success, bytes memory response) = payable(to).call{value: value}(
      abi.encodePacked(data, contextMsgSender)
    );

    if (!success) {
      // solhint-disable-next-line no-inline-assembly
      assembly {
        revert(add(response, 32), mload(response))
      }
    }
  }

  function _sendRequests(
    address sender,
    address from,
    address[] calldata to,
    uint256[] calldata value,
    bytes[] calldata data
  ) private {
    uint256 len = to.length;

    if (len != value.length || len != data.length) {
      revert InvalidRequestsBatchSize();
    }

    for (uint256 index; index < len; ) {
      _sendRequest(sender, from, to[index], value[index], data[index]);

      unchecked {
        ++index;
      }
    }
  }
}
