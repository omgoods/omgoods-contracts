// SPDX-License-Identifier: None
pragma solidity 0.8.28;

import {IACTVotingTypes} from "./IACTVotingTypes.sol";

/* solhint-disable func-name-mixedcase */

interface IACTVotingPseudoEvents is IACTVotingTypes {
  // pseudo events

  function ProposalSubmitted(
    bytes32 proposalHash,
    Proposal memory proposal
  ) external view;

  function ProposalDismissed(bytes32 proposalHash) external view;

  function ProposalExecuted(
    bytes32 proposalHash,
    bytes memory result
  ) external view;

  function ProposalReverted(
    bytes32 proposalHash,
    bytes memory result
  ) external view;

  function VoteSubmitted(
    bytes32 proposalHash,
    address account,
    Vote memory vote
  ) external view;

  function VoteUpdated(
    bytes32 proposalHash,
    address account,
    Vote memory proposalVote
  ) external view;
}
