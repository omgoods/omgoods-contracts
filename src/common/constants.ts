export enum TypedDataDomainNames {
  ACTRegistry = 'ACT Registry',
}

export enum ACTVariants {
  UnknownOrAny,
  Fungible,
  NonFungible,
}

export enum ACTStates {
  Locked,
  Active,
  Tracked,
}

export enum ACTSystems {
  AbsoluteMonarchy,
  ConstitutionalMonarchy,
  Democracy,
}

export enum ACTVotingVoteKinds {
  Unknown,
  Accept,
  Reject,
}

export enum ACTVotingProposalStatuses {
  Unknown,
  New,
  Dismissed,
  Voting,
  Accepted,
  Rejected,
  Executed,
  Reverted,
}
