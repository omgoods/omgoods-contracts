// SPDX-License-Identifier: None
pragma solidity 0.8.28;

import {ACTSystems, ACTStates} from "../../core/enums.sol";
import {ACTSettings} from "../../core/structs.sol";
import {ACTExtension} from "../ACTExtension.sol";
import {IACTVoting} from "./interfaces/IACTVoting.sol";
import {ACTVotingProposalStatuses, ACTVotingVoteKinds} from "./enums.sol";
import {ACTVotingProposal, ACTVotingProposalVote} from "./structs.sol";

// WIP

contract ACTVotingExtension is ACTExtension, IACTVoting {
  // slots

  bytes32 private constant PROPOSAL_SLOT =
    keccak256(abi.encodePacked("act.extensions.voting#proposal"));

  bytes32 private constant PROPOSAL_VOTE_SLOT =
    keccak256(abi.encodePacked("act.extensions.voting#proposalVote"));

  // external getters

  function getSupportedSelectors()
    external
    pure
    virtual
    override
    returns (bytes4[] memory result)
  {
    result = new bytes4[](6);

    result[0] = IACTVoting.getProposal.selector;
    result[1] = IACTVoting.getProposalVote.selector;
    result[2] = IACTVoting.submitProposal.selector;
    result[3] = IACTVoting.dismissProposal.selector;
    result[4] = IACTVoting.executeProposal.selector;
    result[5] = IACTVoting.submitProposalVote.selector;

    return result;
  }

  function getProposal(
    bytes32 hash
  ) external pure returns (ACTVotingProposal memory result) {
    result = _getProposal(hash);

    if (result.status == ACTVotingProposalStatuses.New) {
      // TODO
    }

    return result;
  }

  function getProposalVote(
    bytes32 proposalHash,
    address account
  ) external pure returns (ACTVotingProposalVote memory) {
    return _getProposalVote(proposalHash, account);
  }

  // external setters

  function submitProposal(
    bytes[] memory actions
  ) external returns (bytes32 result) {
    ACTSettings memory settings = _getSettings();

    uint48 epoch = _getEpoch(settings);

    require(epoch != 0);

    result = keccak256(abi.encode(epoch, actions));

    ACTVotingProposal storage proposal = _getProposal(result);

    require(proposal.status == ACTVotingProposalStatuses.Unknown);

    proposal.status = ACTVotingProposalStatuses.New;
    proposal.creator = msg.sender;
    proposal.actions = actions;

    // TODO

    return result;
  }

  function dismissProposal(bytes32 hash) external {
    // TODO

    ACTVotingProposal storage proposal = _getProposal(hash);

    require(proposal.status == ACTVotingProposalStatuses.New);

    // TODO

    proposal.status = ACTVotingProposalStatuses.Dismissed;
  }

  function executeProposal(bytes32 hash) external {
    // TODO

    ACTVotingProposal storage proposal = _getProposal(hash);

    // TODO

    proposal.status = ACTVotingProposalStatuses.Executed;
  }

  function submitProposalVote(
    bytes32 proposalHash,
    ACTVotingVoteKinds voteKind
  ) external {
    // TODO
  }

  // private getters

  function _getProposal(
    bytes32 hash
  ) private pure returns (ACTVotingProposal storage result) {
    bytes32 slot = keccak256(abi.encodePacked(PROPOSAL_SLOT, hash));

    // solhint-disable-next-line no-inline-assembly
    assembly ("memory-safe") {
      result.slot := slot
    }

    return result;
  }

  function _getProposalVote(
    bytes32 proposalHash,
    address account
  ) private pure returns (ACTVotingProposalVote storage result) {
    bytes32 slot = keccak256(
      abi.encodePacked(PROPOSAL_VOTE_SLOT, proposalHash, account)
    );

    // solhint-disable-next-line no-inline-assembly
    assembly ("memory-safe") {
      result.slot := slot
    }

    return result;
  }
}
