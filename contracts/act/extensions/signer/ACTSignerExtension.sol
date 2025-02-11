// SPDX-License-Identifier: None
pragma solidity 0.8.28;

import {IERC1271} from "@openzeppelin/contracts/interfaces/IERC1271.sol";
import {ACTExtension} from "../ACTExtension.sol";
import {IACTSignerPseudoEvents} from "./interfaces/IACTSignerPseudoEvents.sol";
import {ACTSignerStorage} from "./ACTSignerStorage.sol";

contract ACTSignerExtension is IERC1271, ACTExtension, ACTSignerStorage {
  // events

  event SignatureUpdated(bytes32 hash, Signature signature);

  // error

  error InvalidSignatureHash();

  // external getters

  function getSupportedSelectors()
    external
    pure
    virtual
    override
    returns (bytes4[] memory result)
  {
    result = new bytes4[](4);

    result[0] = IERC1271.isValidSignature.selector;
    result[1] = ACTSignerExtension.getSignature.selector;
    result[2] = ACTSignerExtension.validateSignature.selector;
    result[3] = ACTSignerExtension.setSignature.selector;

    return result;
  }

  function isValidSignature(
    bytes32 hash,
    bytes memory
  ) external view returns (bytes4) {
    bool isValid;

    Signature memory signature = _getSignature(hash);

    if (signature.mode == SignatureModes.TimestampBase) {
      uint48 timestamp = uint48(block.timestamp);

      isValid =
        timestamp >= signature.validAfter &&
        timestamp <= signature.validUntil;
    } else {
      isValid = signature.mode == SignatureModes.Infinity;
    }

    return isValid ? IERC1271.isValidSignature.selector : bytes4(0xffffffff);
  }

  function getSignature(bytes32 hash) external pure returns (Signature memory) {
    return _getSignature(hash);
  }

  function validateSignature(bytes32 hash) external pure returns (uint256) {
    Signature memory signature = _getSignature(hash);

    if (signature.mode == SignatureModes.TimestampBase) {
      return
        (uint256(signature.validUntil) << 160) |
        (uint256(signature.validAfter) << 208);
    } else {
      return signature.mode == SignatureModes.Infinity ? 0 : 1;
    }
  }

  // external setters

  function setSignature(
    bytes32 hash,
    Signature calldata signature
  ) external onlyOwner returns (bool) {
    require(hash != bytes32(0), InvalidSignatureHash());

    Signature storage signature_ = _getSignature(hash);

    if (
      signature.mode == signature_.mode &&
      signature.validAfter == signature_.validAfter &&
      signature.validUntil == signature_.validUntil
    ) {
      // nothing to do
      return false;
    }

    signature_.mode = signature.mode;
    signature_.validAfter = signature.validAfter;
    signature_.validUntil = signature.validUntil;

    emit SignatureUpdated(hash, signature);

    _triggerRegistryEvent(
      abi.encodeCall(IACTSignerPseudoEvents.SignatureUpdated, (hash, signature))
    );

    return true;
  }
}
