// SPDX-License-Identifier: None
pragma solidity 0.8.28;

import {ACTVotingVoteKinds} from "../enums.sol";
import {ACTVotingProposal, ACTVotingProposalVote} from "../structs.sol";

interface IACTVoting {
  // events

  event ProposalSubmitted(bytes32 proposalHash, ACTVotingProposal proposal);

  event ProposalVoteSubmitted(
    bytes32 proposalHash,
    address account,
    ACTVotingProposalVote proposalVote
  );

  event ProposalVoteUpdated(
    bytes32 proposalHash,
    address account,
    ACTVotingProposalVote proposalVote
  );

  event ProposalDismissed(bytes32 proposalHash);

  event ProposalExecuted(bytes32 proposalHash, bytes proposalResult);

  event ProposalReverted(bytes32 proposalHash, bytes proposalResult);

  // external getters

  function getProposal(
    bytes32 hash
  ) external view returns (ACTVotingProposal memory);

  function getProposalVote(
    bytes32 proposalHash,
    address account
  ) external view returns (ACTVotingProposalVote memory);

  function getVotingPower(address account) external view returns (uint256);

  // external setters

  function submitProposal(bytes calldata data) external returns (bytes32);

  function dismissProposal(bytes32 hash) external returns (bool);

  function executeProposal(bytes32 hash) external returns (bool);

  function submitProposalVote(
    bytes32 proposalHash,
    ACTVotingVoteKinds voteKind
  ) external returns (bool);
}
