// SPDX-License-Identifier: None
pragma solidity 0.8.28;

import {ACTVotingProposalStatuses, ACTVotingVoteKinds} from "./enums.sol";

struct ACTVotingProposal {
  ACTVotingProposalStatuses status;
  uint48 epoch;
  address creator;
  uint256 acceptedPower;
  uint256 rejectedPower;
  bytes data;
}

struct ACTVotingProposalVote {
  ACTVotingVoteKinds kind;
  uint256 power;
}
