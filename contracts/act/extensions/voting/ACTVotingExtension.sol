// SPDX-License-Identifier: None
pragma solidity 0.8.28;

import {Epochs} from "../../../common/Epochs.sol";
import {ACTExtension} from "../ACTExtension.sol";
import {IACTVotingPseudoEvents} from "./interfaces/IACTVotingPseudoEvents.sol";
import {ACTVotingStorage} from "./ACTVotingStorage.sol";

contract ACTVotingExtension is ACTExtension, ACTVotingStorage {
  using Epochs for Epochs.Checkpoints;

  // errors

  error InvalidSystems();

  error InvalidEpoch();

  error InsufficientVotingPower();

  error ProposalAlreadyExists();

  error ProposalNotFound();

  error MsgSenderIsNotTheProposalCreator();

  error InvalidProposalStatus();

  error InvalidVoteKind();

  // events

  event ProposalSubmitted(bytes32 proposalHash, Proposal proposal);

  event ProposalDismissed(bytes32 proposalHash);

  event ProposalExecuted(bytes32 proposalHash, bytes result);

  event ProposalReverted(bytes32 proposalHash, bytes result);

  event VoteSubmitted(bytes32 proposalHash, address account, Vote vote);

  event VoteUpdated(bytes32 proposalHash, address account, Vote vote);

  // external getters

  function getSupportedSelectors()
    external
    pure
    virtual
    override
    returns (bytes4[] memory result)
  {
    result = new bytes4[](7);

    result[0] = ACTVotingExtension.getProposal.selector;
    result[1] = ACTVotingExtension.getVote.selector;
    result[2] = ACTVotingExtension.getVotingPower.selector;
    result[3] = ACTVotingExtension.submitProposal.selector;
    result[4] = ACTVotingExtension.dismissProposal.selector;
    result[5] = ACTVotingExtension.executeProposal.selector;
    result[6] = ACTVotingExtension.submitVote.selector;

    return result;
  }

  function getProposal(
    bytes32 proposalHash
  ) external view returns (Proposal memory result) {
    result = _getProposal(proposalHash);

    result.status = _calcProposalStatus(_getEpoch(), result);

    return result;
  }

  function getVote(
    bytes32 proposalHash,
    address account
  ) external pure returns (Vote memory) {
    return _getVote(proposalHash, account);
  }

  function getVotingPower(address account) external view returns (uint256) {
    return _getVotingPowerAt(_getEpoch(), account);
  }

  // external setters

  function submitProposal(
    bytes calldata data
  ) external returns (bytes32 proposalHash) {
    Settings memory settings = _getSettings();

    require(settings.system != Systems.AbsoluteMonarchy, InvalidSystems());

    uint48 epoch = _getEpoch(settings);

    require(epoch != 0, InvalidEpoch());

    if (settings.system == Systems.ConstitutionalMonarchy) {
      _requireOnlyMaintainer();
    } else {
      require(
        _getVotingPowerAt(epoch, msg.sender) != 0,
        InsufficientVotingPower()
      );
    }

    unchecked {
      ++epoch;
    }

    proposalHash = keccak256(abi.encodePacked(epoch, data));

    Proposal storage proposal = _getProposal(proposalHash);

    require(
      proposal.status == ProposalStatuses.Unknown,
      ProposalAlreadyExists()
    );

    proposal.status = ProposalStatuses.New;
    proposal.epoch = epoch;
    proposal.creator = msg.sender;
    proposal.data = data;

    emit ProposalSubmitted(proposalHash, proposal);

    _triggerRegistryEvent(
      abi.encodeCall(
        IACTVotingPseudoEvents.ProposalSubmitted,
        (proposalHash, proposal)
      )
    );

    return proposalHash;
  }

  function dismissProposal(bytes32 proposalHash) external returns (bool) {
    Proposal storage proposal = _getProposal(proposalHash);

    require(proposal.status != ProposalStatuses.Unknown, ProposalNotFound());

    require(proposal.creator == msg.sender, MsgSenderIsNotTheProposalCreator());

    ProposalStatuses proposalStatus = _calcProposalStatus(
      _getEpoch(),
      proposal
    );

    if (proposalStatus == ProposalStatuses.Dismissed) {
      // nothing to do
      return false;
    }

    require(proposalStatus == ProposalStatuses.New, InvalidProposalStatus());

    proposal.status = ProposalStatuses.Dismissed;

    emit ProposalDismissed(proposalHash);

    _triggerRegistryEvent(
      abi.encodeCall(IACTVotingPseudoEvents.ProposalDismissed, (proposalHash))
    );

    return true;
  }

  function executeProposal(bytes32 proposalHash) external returns (bool) {
    Proposal storage proposal = _getProposal(proposalHash);

    require(proposal.status != ProposalStatuses.Unknown, ProposalNotFound());

    ProposalStatuses proposalStatus = _calcProposalStatus(
      _getEpoch(),
      proposal
    );

    if (proposalStatus >= ProposalStatuses.Executed) {
      // nothing to do
      return false;
    }

    require(
      proposalStatus == ProposalStatuses.Accepted,
      InvalidProposalStatus()
    );

    // solhint-disable-next-line avoid-low-level-calls
    (bool success, bytes memory result) = address(this).call(proposal.data);

    if (success) {
      proposal.status = ProposalStatuses.Executed;

      emit ProposalExecuted(proposalHash, result);

      _triggerRegistryEvent(
        abi.encodeCall(
          IACTVotingPseudoEvents.ProposalExecuted,
          (proposalHash, result)
        )
      );
    } else {
      proposal.status = ProposalStatuses.Reverted;

      emit ProposalReverted(proposalHash, result);

      _triggerRegistryEvent(
        abi.encodeCall(
          IACTVotingPseudoEvents.ProposalReverted,
          (proposalHash, result)
        )
      );
    }

    return true;
  }

  function submitVote(
    bytes32 proposalHash,
    VoteKinds voteKind
  ) external returns (bool) {
    Proposal storage proposal = _getProposal(proposalHash);

    require(proposal.status != ProposalStatuses.Unknown, ProposalNotFound());

    require(voteKind != VoteKinds.Unknown, InvalidVoteKind());

    uint48 epoch = _getEpoch();

    ProposalStatuses proposalStatus = _calcProposalStatus(epoch, proposal);

    require(proposalStatus == ProposalStatuses.Voting, InvalidProposalStatus());

    Vote storage vote = _getVote(proposalHash, msg.sender);

    VoteKinds oldVoteKind = vote.kind;

    if (oldVoteKind == voteKind) {
      // nothing to do
      return false;
    }

    uint256 votePower = _getVotingPowerAt(proposal.epoch, msg.sender);

    require(votePower != 0, InsufficientVotingPower());

    vote.kind = voteKind;

    if (oldVoteKind == VoteKinds.Unknown) {
      vote.power = votePower;

      unchecked {
        if (voteKind == VoteKinds.Accept) {
          proposal.acceptedPower += votePower;
        } else {
          proposal.rejectedPower += votePower;
        }
      }

      emit VoteSubmitted(proposalHash, msg.sender, vote);

      _triggerRegistryEvent(
        abi.encodeCall(
          IACTVotingPseudoEvents.VoteSubmitted,
          (proposalHash, msg.sender, vote)
        )
      );
    } else {
      uint256 oldVotePower = vote.power;

      unchecked {
        if (voteKind == VoteKinds.Accept) {
          proposal.acceptedPower += votePower;
          proposal.rejectedPower -= oldVotePower;
        } else if (voteKind == VoteKinds.Reject) {
          proposal.acceptedPower -= oldVotePower;
          proposal.rejectedPower += votePower;
        }
      }

      emit VoteUpdated(proposalHash, msg.sender, vote);

      _triggerRegistryEvent(
        abi.encodeCall(
          IACTVotingPseudoEvents.VoteUpdated,
          (proposalHash, msg.sender, vote)
        )
      );
    }

    return true;
  }

  // private getters

  function _getVotingPowerAt(
    uint48 epoch,
    address account
  ) private view returns (uint256) {
    if (epoch == 1) {
      return 0;
    }

    unchecked {
      --epoch;
    }

    (bool exists, uint256 balanceAt) = _getBalanceCheckpoints(account).lookup(
      epoch
    );

    uint256 balance = _getBalanceSlot(account).value;

    if (exists) {
      return balanceAt < balance ? balanceAt : balance;
    }

    return balance;
  }

  function _calcProposalStatus(
    uint48 epoch,
    Proposal memory proposal
  ) private pure returns (ProposalStatuses) {
    if (proposal.status != ProposalStatuses.New || epoch < proposal.epoch) {
      return proposal.status;
    }

    if (epoch == proposal.epoch) {
      return ProposalStatuses.Voting;
    }

    return
      proposal.acceptedPower != 0 &&
        proposal.acceptedPower > proposal.rejectedPower
        ? ProposalStatuses.Accepted
        : ProposalStatuses.Rejected;
  }
}
