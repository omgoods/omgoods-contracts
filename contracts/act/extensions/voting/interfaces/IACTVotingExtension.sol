// SPDX-License-Identifier: None
pragma solidity 0.8.28;

import {IACTVotingTypes} from "./IACTVotingTypes.sol";

interface IACTVotingExtension is IACTVotingTypes {
  // events

  event ProposalSubmitted(bytes32 proposalHash, Proposal proposal);

  event ProposalDismissed(bytes32 proposalHash);

  event ProposalExecuted(bytes32 proposalHash, bytes proposalResult);

  event ProposalReverted(bytes32 proposalHash, bytes proposalResult);

  event VoteSubmitted(bytes32 proposalHash, address account, Vote vote);

  event VoteUpdated(bytes32 proposalHash, address account, Vote vote);

  // external getters

  function getProposal(
    bytes32 proposalHash
  ) external view returns (Proposal memory);

  function getVote(
    bytes32 proposalHash,
    address account
  ) external view returns (Vote memory);

  function getVotingPower(address account) external view returns (uint256);

  // external setters

  function submitProposal(bytes calldata data) external returns (bytes32);

  function dismissProposal(bytes32 proposalHash) external returns (bool);

  function executeProposal(bytes32 proposalHash) external returns (bool);

  function submitVote(
    bytes32 proposalHash,
    VoteKinds voteKind
  ) external returns (bool);
}
