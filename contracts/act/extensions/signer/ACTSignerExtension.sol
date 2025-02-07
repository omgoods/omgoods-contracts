// SPDX-License-Identifier: None
pragma solidity 0.8.28;

import {IERC1271} from "@openzeppelin/contracts/interfaces/IERC1271.sol";
import {ACTExtension} from "../ACTExtension.sol";
import {IACTSigner} from "./interfaces/IACTSigner.sol";
import {IACTSignerEvents} from "./interfaces/IACTSignerEvents.sol";
import {ACTSignerSignatureModes} from "./enums.sol";
import {ACTSignerSignature} from "./structs.sol";

contract ACTSignerExtension is ACTExtension, IACTSigner {
  // slots

  bytes32 private constant SIGNATURE_SLOT =
    keccak256(abi.encodePacked("act.extensions.signer#signature"));

  // external getters

  function getSupportedSelectors()
    external
    pure
    virtual
    override
    returns (bytes4[] memory result)
  {
    result = new bytes4[](3);

    result[0] = IERC1271.isValidSignature.selector;
    result[1] = IACTSigner.getSignature.selector;
    result[2] = IACTSigner.validateSignature.selector;

    return result;
  }

  function isValidSignature(
    bytes32 hash,
    bytes memory
  ) external view returns (bytes4) {
    bool isValid;

    ACTSignerSignature memory signature = _getSignature(hash);

    if (signature.mode == ACTSignerSignatureModes.TimestampBase) {
      uint48 timestamp = uint48(block.timestamp);

      isValid =
        timestamp >= signature.validAfter &&
        timestamp <= signature.validUntil;
    } else {
      isValid = signature.mode == ACTSignerSignatureModes.Infinity;
    }

    return isValid ? IERC1271.isValidSignature.selector : bytes4(0xffffffff);
  }

  function getSignature(
    bytes32 hash
  ) external pure returns (ACTSignerSignature memory) {
    return _getSignature(hash);
  }

  function validateSignature(bytes32 hash) external pure returns (uint256) {
    ACTSignerSignature memory signature = _getSignature(hash);

    if (signature.mode == ACTSignerSignatureModes.TimestampBase) {
      return
        (uint256(signature.validUntil) << 160) |
        (uint256(signature.validAfter) << 208);
    } else {
      return signature.mode == ACTSignerSignatureModes.Infinity ? 0 : 1;
    }
  }

  // external setters

  function setSignature(
    bytes32 hash,
    ACTSignerSignature calldata signature
  ) external onlyOwner returns (bool) {
    require(hash != bytes32(0), InvalidSignatureHash());

    ACTSignerSignature storage signature_ = _getSignature(hash);

    if (
      signature.mode == signature_.mode &&
      signature.validAfter == signature_.validAfter &&
      signature.validUntil == signature_.validUntil
    ) {
      return false;
    }

    signature_.mode = signature.mode;
    signature_.validAfter = signature.validAfter;
    signature_.validUntil = signature.validUntil;

    emit SignatureUpdated(hash, signature);

    _triggerRegistryEvent(
      abi.encodeCall(IACTSignerEvents.SignatureUpdated, (hash, signature))
    );

    return true;
  }

  // private getters

  function _getSignature(
    bytes32 hash
  ) private pure returns (ACTSignerSignature storage result) {
    bytes32 slot = keccak256(abi.encodePacked(SIGNATURE_SLOT, hash));

    // solhint-disable-next-line no-inline-assembly
    assembly ("memory-safe") {
      result.slot := slot
    }

    return result;
  }
}
