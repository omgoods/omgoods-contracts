// SPDX-License-Identifier: None
pragma solidity 0.8.27;

import {IERC1271} from "@openzeppelin/contracts/interfaces/IERC1271.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {Bytes} from "../utils/Bytes.sol";

contract Forwarder is EIP712 {
  using ECDSA for bytes32;
  using Bytes for bytes[];

  struct RequestData {
    address account;
    uint256 nonce;
    address to;
    bytes data;
  }

  struct RequestBatchData {
    address account;
    uint256 nonce;
    address[] to;
    bytes[] data;
  }

  bytes32 private constant REQUEST_TYPEHASH =
    keccak256(
      "Request(address account,uint256 nonce,address to,bytes data)" //
    );

  bytes32 private constant REQUEST_BATCH_TYPEHASH =
    keccak256(
      "RequestBatch(address account,uint256 nonce,address[] to,bytes[] data)"
    );

  // storage

  mapping(address => uint256) private _nextNonce;

  // events

  event RequestSent(
    address account,
    uint256 nonce,
    address to,
    bytes data,
    uint256 timestamp
  );

  event RequestBatchSent(
    address account,
    uint256 nonce,
    address[] to,
    bytes[] data,
    uint256 timestamp
  );

  // errors

  error AccountIsTheZeroAddress();

  error InvalidSignature();

  error CallToTheZeroAddress();

  error EmptyRequestBatch();

  error InvalidRequestBatchSize();

  // deployment

  constructor(string memory name) EIP712(name, "1") {
    //
  }

  // external getters

  function getNextNonce(address account) external view returns (uint256) {
    return _nextNonce[account];
  }

  function hashRequest(
    RequestData calldata requestData
  ) external view returns (bytes32) {
    return
      _hashRequest(
        requestData.account,
        requestData.nonce,
        requestData.to,
        requestData.data
      );
  }

  function hashRequestBatch(
    RequestBatchData calldata requestBatchData
  ) external view returns (bytes32) {
    return
      _hashRequestBatch(
        requestBatchData.account,
        requestBatchData.nonce,
        requestBatchData.to,
        requestBatchData.data
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
          abi.encode(
            REQUEST_TYPEHASH, //
            account,
            nonce,
            to,
            keccak256(data)
          )
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
            REQUEST_BATCH_TYPEHASH,
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
      (account.code.length == 0 ||
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

    emit RequestSent(account, nonce, to, data, block.timestamp);
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

    emit RequestBatchSent(account, nonce, to, data, block.timestamp);
  }

  function _executeRequestCall(
    address account,
    address to,
    bytes calldata data
  ) private {
    if (to == address(0)) {
      revert CallToTheZeroAddress();
    }

    // solhint-disable-next-line avoid-low-level-calls
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
