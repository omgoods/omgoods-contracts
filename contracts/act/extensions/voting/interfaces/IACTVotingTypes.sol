// SPDX-License-Identifier: None
pragma solidity 0.8.28;

interface IACTVotingTypes {
  // enums

  enum ProposalStatuses {
    Unknown, // 0
    New, // 1
    Dismissed, // 2
    Voting, // 3
    Accepted, // 4
    Rejected, // 5
    Executed, // 6
    Reverted // 7
  }

  enum VoteKinds {
    Unknown, // 0
    Accept, // 1
    Reject // 2
  }

  // structs

  struct Proposal {
    ProposalStatuses status;
    uint48 epoch;
    address creator;
    uint256 acceptedPower;
    uint256 rejectedPower;
    bytes data;
  }

  struct Vote {
    VoteKinds kind;
    uint256 power;
  }
}
