// SPDX-License-Identifier: None
pragma solidity 0.8.28;

import {IERC1271} from "@openzeppelin/contracts/interfaces/IERC1271.sol";
import {ACTExtension} from "../ACTExtension.sol";

contract ACTSignerExtension is IERC1271, ACTExtension {
  // slots

  bytes32 private constant SIGNATURE_SLOT =
    keccak256(abi.encodePacked("act.extensions.signer#signature"));

  // enums

  enum SignatureModes {
    Unknown, // 0
    Infinity, // 1
    EpochBase, // 2
    TimestampBase // 3
  }

  // struct

  struct Signature {
    SignatureModes mode;
    uint48 validFrom;
    uint48 validTo;
  }

  // error

  error InvalidSignatureHash();

  // events

  event SignatureUpdated(bytes32 hash, Signature signature);

  // external getters

  function getSupportedSelectors()
    external
    pure
    virtual
    override
    returns (bytes4[] memory result)
  {
    result = new bytes4[](2);

    result[0] = ACTSignerExtension.isValidSignature.selector;
    result[1] = ACTSignerExtension.setSignature.selector;

    return result;
  }

  function isValidSignature(
    bytes32 hash,
    bytes memory
  ) external view returns (bytes4) {
    bool isValid;

    Signature memory signature = _getSignature(hash);

    if (signature.mode == SignatureModes.Infinity) {
      isValid = true;
    } else if (signature.mode == SignatureModes.EpochBase) {
      uint48 epoch = _getEpoch();

      isValid = epoch >= signature.validFrom && epoch <= signature.validTo;
    } else if (signature.mode == SignatureModes.TimestampBase) {
      uint48 timestamp = uint48(block.timestamp);

      isValid =
        timestamp >= signature.validFrom &&
        timestamp <= signature.validTo;
    }

    return isValid ? IERC1271.isValidSignature.selector : bytes4(0xffffffff);
  }

  // external setters

  function setSignature(
    bytes32 hash,
    Signature calldata signature
  ) external onlyOwner returns (bool) {
    return _setSignature(hash, signature);
  }

  // internal setters

  function _setSignature(
    bytes32 hash,
    Signature memory signature
  ) internal returns (bool) {
    require(hash != bytes32(0), InvalidSignatureHash());

    Signature storage signature_ = _getSignature(hash);

    if (
      signature.mode == signature_.mode &&
      signature.validFrom == signature_.validFrom &&
      signature.validTo == signature_.validTo
    ) {
      return false;
    }

    signature.mode = signature_.mode;
    signature.validFrom = signature_.validFrom;
    signature.validTo = signature_.validTo;

    emit SignatureUpdated(hash, signature_);

    return true;
  }

  // private getters

  function _getSignature(
    bytes32 hash
  ) private pure returns (Signature storage result) {
    bytes32 slot = keccak256(abi.encodePacked(SIGNATURE_SLOT, hash));

    // solhint-disable-next-line no-inline-assembly
    assembly ("memory-safe") {
      result.slot := slot
    }

    return result;
  }
}
