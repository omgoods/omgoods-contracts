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

  struct RequestData {
    address from;
    uint256 nonce;
    address to;
    uint256 value;
    bytes data;
  }

  struct RequestsData {
    address from;
    uint256 nonce;
    address[] to;
    uint256[] value;
    bytes[] data;
  }

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

  event RequestSent(
    address sender,
    address from,
    address to,
    uint256 value,
    bytes data
  );

  event RequestsSent(
    address sender,
    address from,
    address[] to,
    uint256[] value,
    bytes[] data
  );

  // errors

  error AccountRegistryIsTheZeroAddress();

  error InvalidRequestNonce();

  error RequestFromTheZeroAddress();

  error RequestToTheZeroAddress();

  error RequestToTheInvalidAddress();

  error RequestForbidden();

  error InvalidRequestsBatchSize();

  error EmptyRequestsBatch();

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
    RequestData calldata requestData
  ) external view returns (bytes32) {
    return _hashRequest(requestData);
  }

  function hashRequests(
    RequestsData calldata requestsData
  ) external view returns (bytes32) {
    return _hashRequests(requestsData);
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
    _sendRequest(msg.sender, msg.sender, to, value, data, true);
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

    _sendRequest(msg.sender, from, to, value, data, true);
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
    RequestData calldata requestData,
    bytes calldata senderSignature
  ) external {
    address sender = _verifyRequest(
      _hashRequest(requestData),
      senderSignature,
      requestData.from,
      requestData.nonce
    );

    _sendRequest(
      sender,
      requestData.from,
      requestData.to,
      requestData.value,
      requestData.data,
      true
    );
  }

  function forwardRequests(
    RequestsData calldata requestsData,
    bytes calldata senderSignature
  ) external {
    address sender = _verifyRequest(
      _hashRequests(requestsData),
      senderSignature,
      requestsData.from,
      requestsData.nonce
    );

    _sendRequests(
      sender,
      requestsData.from,
      requestsData.to,
      requestsData.value,
      requestsData.data
    );
  }

  // private getters

  function _hashRequest(
    RequestData calldata requestData
  ) private view returns (bytes32) {
    return
      _hashTypedDataV4(
        keccak256(
          abi.encode(
            REQUEST_TYPE_HASH,
            requestData.from,
            requestData.nonce,
            requestData.to,
            requestData.value,
            keccak256(requestData.data)
          )
        )
      );
  }

  function _hashRequests(
    RequestsData calldata requestsData
  ) private view returns (bytes32) {
    return
      _hashTypedDataV4(
        keccak256(
          abi.encode(
            REQUESTS_TYPE_HASH,
            requestsData.from,
            requestsData.nonce,
            keccak256(abi.encodePacked(requestsData.to)),
            keccak256(abi.encodePacked(requestsData.value)),
            requestsData.data.deepKeccak256()
          )
        )
      );
  }

  function _isTrustedSender(
    address account,
    address sender
  ) private view returns (bool) {
    return
      account == sender ||
      IAccountRegistry(_accountRegistry).isAccountOwner(account, sender);
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

  function _verifyRequest(address from) private pure {
    if (from == address(0)) {
      revert RequestFromTheZeroAddress();
    }
  }

  function _verifyRequest(address sender, address from) private view {
    _verifyRequest(from);

    if (!_isTrustedSender(from, sender)) {
      revert RequestForbidden();
    }
  }

  // private setters

  function _verifyRequest(
    bytes32 hash,
    bytes calldata signature,
    address from,
    uint256 nonce
  ) private returns (address signer) {
    _verifyRequest(from);

    unchecked {
      if (_nonce[from] != nonce) {
        revert InvalidRequestNonce();
      }
    }

    uint256 newNonce;

    unchecked {
      newNonce = nonce + 1;
    }

    _nonce[from] = newNonce;

    emit NonceUpdated(from, newNonce);

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
    bytes calldata data,
    bool triggerEvent
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

    if (triggerEvent) {
      emit RequestSent(sender, from, to, value, data);
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

    if (len == 0) {
      revert EmptyRequestsBatch();
    }

    if (len != value.length || len != data.length) {
      revert InvalidRequestsBatchSize();
    }

    for (uint256 index; index < len; ) {
      _sendRequest(sender, from, to[index], value[index], data[index], false);

      unchecked {
        ++index;
      }
    }

    emit RequestsSent(sender, from, to, value, data);
  }
}
