// SPDX-License-Identifier: None
pragma solidity 0.8.28;

import {ACTVotingProposal, ACTVotingProposalVote} from "../structs.sol";

/* solhint-disable func-name-mixedcase */

interface IACTVotingEvents {
  // pseudo events

  function ProposalSubmitted(
    bytes32 proposalHash,
    ACTVotingProposal memory proposal
  ) external view;

  function ProposalVoteSubmitted(
    bytes32 proposalHash,
    address account,
    ACTVotingProposalVote memory proposalVote
  ) external view;

  function ProposalVoteUpdated(
    bytes32 proposalHash,
    address account,
    ACTVotingProposalVote memory proposalVote
  ) external view;

  function ProposalDismissed(bytes32 proposalHash) external view;

  function ProposalExecuted(
    bytes32 proposalHash,
    bytes memory proposalResult
  ) external view;

  function ProposalReverted(
    bytes32 proposalHash,
    bytes memory proposalResult
  ) external view;
}
