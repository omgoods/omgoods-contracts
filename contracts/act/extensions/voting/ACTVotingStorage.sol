// SPDX-License-Identifier: None
pragma solidity 0.8.28;

import {IACTVotingTypes} from "./interfaces/IACTVotingTypes.sol";

contract ACTVotingStorage is IACTVotingTypes {
  // slots

  bytes32 private constant PROPOSAL_SLOT =
    keccak256(abi.encodePacked("act.extensions.voting#proposal"));

  bytes32 private constant VOTE_SLOT =
    keccak256(abi.encodePacked("act.extensions.voting#vote"));

  // internal getters

  function _getProposal(
    bytes32 hash
  ) internal pure returns (Proposal storage result) {
    bytes32 slot = keccak256(abi.encodePacked(PROPOSAL_SLOT, hash));

    // solhint-disable-next-line no-inline-assembly
    assembly ("memory-safe") {
      result.slot := slot
    }

    return result;
  }

  function _getVote(
    bytes32 proposalHash,
    address account
  ) internal pure returns (Vote storage result) {
    bytes32 slot = keccak256(
      abi.encodePacked(VOTE_SLOT, proposalHash, account)
    );

    // solhint-disable-next-line no-inline-assembly
    assembly ("memory-safe") {
      result.slot := slot
    }

    return result;
  }
}
