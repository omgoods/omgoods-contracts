// SPDX-License-Identifier: None
pragma solidity 0.8.28;

import {ACTVotingVoteKinds} from "../enums.sol";
import {ACTVotingProposal, ACTVotingProposalVote} from "../structs.sol";

interface IACTVoting {
  // external getters

  function getProposal(
    bytes32 hash
  ) external view returns (ACTVotingProposal memory);

  function getProposalVote(
    bytes32 proposalHash,
    address account
  ) external view returns (ACTVotingProposalVote memory);

  // external setters

  function submitProposal(bytes[] memory actions) external returns (bytes32);

  function dismissProposal(bytes32 hash) external;

  function executeProposal(bytes32 hash) external;

  function submitProposalVote(
    bytes32 proposalHash,
    ACTVotingVoteKinds voteKind
  ) external;
}
