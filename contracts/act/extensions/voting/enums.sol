// SPDX-License-Identifier: None
pragma solidity 0.8.28;

enum ACTVotingProposalStatuses {
  Unknown, // 0
  New, // 1
  Dismissed, // 2
  Voting, // 3
  Accepted, // 4
  Rejected, // 5
  Executed, // 6
  Reverted // 7
}

enum ACTVotingVoteKinds {
  Unknown, // 0
  Accept, // 1
  Reject // 2
}
