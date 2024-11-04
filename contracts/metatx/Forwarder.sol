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

  struct BatchData {
    address account;
    uint256 nonce;
    address[] to;
    bytes[] data;
  }

  bytes32 private constant REQUEST_TYPEHASH =
    keccak256(
      "Request(address account,uint256 nonce,address to,bytes data)" //
    );

  bytes32 private constant BATCH_TYPEHASH =
    keccak256("Batch(address account,uint256 nonce,address[] to,bytes[] data)");

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

  event BatchSent(
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

  error BatchIsEmpty();

  error InvalidBatchSize();

  // deployment

  constructor(string memory eip712Name) EIP712(eip712Name, "1") {
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

  function hashBatch(
    BatchData calldata requestBatchData
  ) external view returns (bytes32) {
    return
      _hashBatch(
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

  function sendBatch(address[] calldata to, bytes[] calldata data) external {
    _sendBatch(msg.sender, _nextNonce[msg.sender], to, data);
  }

  function forwardRequest(
    address account,
    address to,
    bytes calldata data,
    bytes calldata signature
  ) external {
    uint256 nonce = _nextNonce[account];

    _verifyAccountSignature(
      account,
      _hashRequest(account, nonce, to, data),
      signature
    );

    _sendRequest(account, nonce, to, data);
  }

  function forwardBatch(
    address account,
    address[] calldata to,
    bytes[] calldata data,
    bytes calldata signature
  ) external {
    uint256 nonce = _nextNonce[account];

    _verifyAccountSignature(
      account,
      _hashBatch(account, nonce, to, data),
      signature
    );

    _sendBatch(account, nonce, to, data);
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

  function _hashBatch(
    address account,
    uint256 nonce,
    address[] calldata to,
    bytes[] calldata data
  ) private view returns (bytes32) {
    return
      _hashTypedDataV4(
        keccak256(
          abi.encode(
            BATCH_TYPEHASH,
            account,
            nonce,
            keccak256(abi.encodePacked(to)),
            data.deepKeccak256()
          )
        )
      );
  }

  function _verifyAccountSignature(
    address account,
    bytes32 hash,
    bytes calldata signature
  ) private view {
    require(account != address(0), AccountIsTheZeroAddress());

    address signer = hash.recover(signature);

    if (account != signer) {
      _verifyERC1271AccountSignature(account, hash, signature);
    }
  }

  function _verifyERC1271AccountSignature(
    address account,
    bytes32 hash,
    bytes calldata signature
  ) private view {
    require(account.code.length != 0, InvalidSignature());

    bytes4 selector;

    try IERC1271(account).isValidSignature(hash, signature) returns (
      bytes4 result
    ) {
      selector = result;
    } catch {
      //
    }

    require(
      selector == IERC1271(account).isValidSignature.selector,
      InvalidSignature()
    );
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

    _executeRequest(account, to, data);

    emit RequestSent(account, nonce, to, data, block.timestamp);
  }

  function _sendBatch(
    address account,
    uint256 nonce,
    address[] calldata to,
    bytes[] calldata data
  ) private {
    unchecked {
      _nextNonce[account] = nonce + 1;
    }

    _executeBatch(account, to, data);

    emit BatchSent(account, nonce, to, data, block.timestamp);
  }

  function _executeRequest(
    address account,
    address to,
    bytes calldata data
  ) private {
    require(to != address(0), CallToTheZeroAddress());

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

  function _executeBatch(
    address account,
    address[] calldata to,
    bytes[] calldata data
  ) private {
    uint256 len = to.length;

    require(len != 0, BatchIsEmpty());
    require(len == data.length, InvalidBatchSize());

    for (uint256 index; index < len; ) {
      _executeRequest(account, to[index], data[index]);

      unchecked {
        ++index;
      }
    }
  }
}
