// SPDX-License-Identifier: None
pragma solidity 0.8.21;

import {IERC1271} from "@openzeppelin/contracts/interfaces/IERC1271.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";
import {Bytes} from "../common/utils/Bytes.sol";

contract Gateway is EIP712 {
  using ECDSA for bytes32;
  using Address for address;
  using Bytes for bytes[];

  struct Request {
    address account;
    uint256 nonce;
    address to;
    bytes data;
  }

  struct RequestBatch {
    address account;
    uint256 nonce;
    address[] to;
    bytes[] data;
  }

  bytes32 private constant REQUEST_TYPE_HASH =
    keccak256(
      "Request(address account,uint256 nonce,address to,bytes data)" //
    );

  bytes32 private constant REQUEST_BATCH_TYPE_HASH =
    keccak256(
      "RequestBatch(address account,uint256 nonce,address[] to,bytes[] data)"
    );

  // storage

  mapping(address => uint256) private _nextNonce;

  // events

  event RequestSent(address account, uint256 nonce, address to, bytes data);

  event RequestBatchSent(
    address account,
    uint256 nonce,
    address[] to,
    bytes[] data
  );

  // errors

  error AccountIsTheZeroAddress();

  error InvalidSignature();

  error CallToTheZeroAddress();

  error EmptyRequestBatch();

  error InvalidRequestBatchSize();

  // deployment

  constructor(
    string memory typedDataDomainName,
    string memory typedDataDomainVersion
  ) EIP712(typedDataDomainName, typedDataDomainVersion) {
    //
  }

  // external getters

  function getNextNonce(address account) external view returns (uint256) {
    return _nextNonce[account];
  }

  function hashRequest(
    Request calldata request
  ) external view returns (bytes32) {
    return
      _hashRequest(request.account, request.nonce, request.to, request.data);
  }

  function hashRequestBatch(
    RequestBatch calldata requestBatch
  ) external view returns (bytes32) {
    return
      _hashRequestBatch(
        requestBatch.account,
        requestBatch.nonce,
        requestBatch.to,
        requestBatch.data
      );
  }

  // external setters

  function sendRequest(address to, bytes calldata data) external {
    _sendRequest(msg.sender, _nextNonce[msg.sender], to, data);
  }

  function sendRequestBatch(
    address[] calldata to,
    bytes[] calldata data
  ) external {
    _sendRequestBatch(msg.sender, _nextNonce[msg.sender], to, data);
  }

  function forwardRequest(
    address account,
    address to,
    bytes calldata data,
    bytes calldata signature
  ) external {
    uint256 nonce = _nextNonce[account];

    _verifyAccountSigner(
      account,
      _hashRequest(account, nonce, to, data),
      signature
    );

    _sendRequest(account, nonce, to, data);
  }

  function forwardRequestBatch(
    address account,
    address[] calldata to,
    bytes[] calldata data,
    bytes calldata signature
  ) external {
    uint256 nonce = _nextNonce[account];

    _verifyAccountSigner(
      account,
      _hashRequestBatch(account, nonce, to, data),
      signature
    );

    _sendRequestBatch(account, nonce, to, data);
  }

  // private getters

  function _hashRequest(
    address account,
    uint256 nonce,
    address to,
    bytes calldata data
  ) private view returns (bytes32) {
    return
      _hashTypedDataV4(
        keccak256(
          abi.encode(REQUEST_TYPE_HASH, account, nonce, to, keccak256(data))
        )
      );
  }

  function _hashRequestBatch(
    address account,
    uint256 nonce,
    address[] calldata to,
    bytes[] calldata data
  ) private view returns (bytes32) {
    return
      _hashTypedDataV4(
        keccak256(
          abi.encode(
            REQUEST_BATCH_TYPE_HASH,
            account,
            nonce,
            keccak256(abi.encodePacked(to)),
            data.deepKeccak256()
          )
        )
      );
  }

  function _verifyAccountSigner(
    address account,
    bytes32 hash,
    bytes calldata signature
  ) private view {
    if (account == address(0)) {
      revert AccountIsTheZeroAddress();
    }

    address signer = hash.recover(signature);

    if (
      account != signer &&
      (!account.isContract() ||
        IERC1271(account).isValidSignature(hash, signature) !=
        IERC1271(account).isValidSignature.selector)
    ) {
      revert InvalidSignature();
    }
  }

  // private setters

  function _sendRequest(
    address account,
    uint256 nonce,
    address to,
    bytes calldata data
  ) private {
    unchecked {
      _nextNonce[account] = nonce + 1;
    }

    _executeRequestCall(account, to, data);

    emit RequestSent(account, nonce, to, data);
  }

  function _sendRequestBatch(
    address account,
    uint256 nonce,
    address[] calldata to,
    bytes[] calldata data
  ) private {
    unchecked {
      _nextNonce[account] = nonce + 1;
    }

    _executeRequestBatchCalls(account, to, data);

    emit RequestBatchSent(account, nonce, to, data);
  }

  function _executeRequestCall(
    address account,
    address to,
    bytes calldata data
  ) private {
    if (to == address(0)) {
      revert CallToTheZeroAddress();
    }

    (bool success, bytes memory response) = to.call(
      abi.encodePacked(data, account)
    );

    if (!success) {
      // solhint-disable-next-line no-inline-assembly
      assembly {
        revert(add(response, 32), mload(response))
      }
    }
  }

  function _executeRequestBatchCalls(
    address account,
    address[] calldata to,
    bytes[] calldata data
  ) private {
    uint256 len = to.length;

    if (len == 0) {
      revert EmptyRequestBatch();
    }

    if (len != data.length) {
      revert InvalidRequestBatchSize();
    }

    for (uint256 index; index < len; ) {
      _executeRequestCall(account, to[index], data[index]);

      unchecked {
        ++index;
      }
    }
  }
}
