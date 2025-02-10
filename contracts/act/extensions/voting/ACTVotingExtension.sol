// SPDX-License-Identifier: None
pragma solidity 0.8.28;

import {Epochs} from "../../../common/Epochs.sol";
import {ACTSystems, ACTStates} from "../../core/enums.sol";
import {ACTSettings} from "../../core/structs.sol";
import {ACTExtension} from "../ACTExtension.sol";
import {IACTVoting} from "./interfaces/IACTVoting.sol";
import {IACTVotingEvents} from "./interfaces/IACTVotingEvents.sol";
import {ACTVotingProposalStatuses, ACTVotingVoteKinds} from "./enums.sol";
import {ACTVotingProposal, ACTVotingProposalVote} from "./structs.sol";

contract ACTVotingExtension is ACTExtension, IACTVoting {
  using Epochs for Epochs.Checkpoints;

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
    result = new bytes4[](7);

    result[0] = IACTVoting.getProposal.selector;
    result[1] = IACTVoting.getProposalVote.selector;
    result[2] = IACTVoting.getVotingPower.selector;
    result[3] = IACTVoting.submitProposal.selector;
    result[4] = IACTVoting.dismissProposal.selector;
    result[5] = IACTVoting.executeProposal.selector;
    result[6] = IACTVoting.submitProposalVote.selector;

    return result;
  }

  function getProposal(
    bytes32 hash
  ) external view returns (ACTVotingProposal memory result) {
    result = _getProposal(hash);

    result.status = _calcProposalStatus(_getEpoch(), result);

    return result;
  }

  function getProposalVote(
    bytes32 proposalHash,
    address account
  ) external pure returns (ACTVotingProposalVote memory) {
    return _getProposalVote(proposalHash, account);
  }

  function getVotingPower(address account) external view returns (uint256) {
    return _getVotingPowerAt(_getEpoch(), account);
  }

  // external setters

  function submitProposal(
    bytes calldata data
  ) external returns (bytes32 result) {
    ACTSettings memory settings = _getSettings();

    require(settings.system != ACTSystems.AbsoluteMonarchy);

    uint48 epoch = _getEpoch(settings);

    require(epoch != 0);

    if (settings.system == ACTSystems.ConstitutionalMonarchy) {
      _requireOnlyMaintainer();
    } else {
      require(_getVotingPowerAt(epoch, msg.sender) != 0);
    }

    unchecked {
      ++epoch;
    }

    result = keccak256(abi.encodePacked(epoch, data));

    ACTVotingProposal storage proposal = _getProposal(result);

    require(proposal.status == ACTVotingProposalStatuses.Unknown);

    proposal.status = ACTVotingProposalStatuses.New;
    proposal.epoch = epoch;
    proposal.creator = msg.sender;
    proposal.data = data;

    emit ProposalSubmitted(result, proposal);

    _triggerRegistryEvent(
      abi.encodeCall(IACTVotingEvents.ProposalSubmitted, (result, proposal))
    );

    return result;
  }

  function dismissProposal(bytes32 hash) external returns (bool) {
    ACTVotingProposal storage proposal = _getProposal(hash);

    require(proposal.status != ACTVotingProposalStatuses.Unknown);

    require(proposal.creator == msg.sender);

    ACTVotingProposalStatuses proposalStatus = _calcProposalStatus(
      _getEpoch(),
      proposal
    );

    if (proposalStatus == ACTVotingProposalStatuses.Dismissed) {
      return false;
    }

    require(proposalStatus == ACTVotingProposalStatuses.New);

    proposal.status = ACTVotingProposalStatuses.Dismissed;

    emit ProposalDismissed(hash);

    _triggerRegistryEvent(
      abi.encodeCall(IACTVotingEvents.ProposalDismissed, (hash))
    );

    return true;
  }

  function executeProposal(bytes32 hash) external returns (bool) {
    ACTVotingProposal storage proposal = _getProposal(hash);

    require(proposal.status != ACTVotingProposalStatuses.Unknown);

    ACTVotingProposalStatuses proposalStatus = _calcProposalStatus(
      _getEpoch(),
      proposal
    );

    if (proposalStatus >= ACTVotingProposalStatuses.Executed) {
      return false;
    }

    (bool success, bytes memory result) = address(this).call(proposal.data);

    if (success) {
      proposal.status = ACTVotingProposalStatuses.Executed;

      emit ProposalExecuted(hash, result);

      _triggerRegistryEvent(
        abi.encodeCall(IACTVotingEvents.ProposalExecuted, (hash, result))
      );
    } else {
      proposal.status = ACTVotingProposalStatuses.Reverted;

      emit ProposalReverted(hash, result);

      _triggerRegistryEvent(
        abi.encodeCall(IACTVotingEvents.ProposalReverted, (hash, result))
      );
    }

    return true;
  }

  function submitProposalVote(
    bytes32 proposalHash,
    ACTVotingVoteKinds voteKind
  ) external returns (bool) {
    ACTVotingProposal storage proposal = _getProposal(proposalHash);

    require(proposal.status != ACTVotingProposalStatuses.Unknown);

    require(voteKind != ACTVotingVoteKinds.Unknown);

    uint48 epoch = _getEpoch();

    ACTVotingProposalStatuses proposalStatus = _calcProposalStatus(
      epoch,
      proposal
    );

    require(proposalStatus == ACTVotingProposalStatuses.Voting);

    ACTVotingProposalVote storage vote = _getProposalVote(
      proposalHash,
      msg.sender
    );

    ACTVotingVoteKinds oldVoteKind = vote.kind;

    if (oldVoteKind == voteKind) {
      return false;
    }

    uint256 votePower = _getVotingPowerAt(proposal.epoch, msg.sender);

    require(votePower != 0);

    vote.kind = voteKind;

    if (oldVoteKind == ACTVotingVoteKinds.Unknown) {
      vote.power = votePower;

      unchecked {
        if (voteKind == ACTVotingVoteKinds.Accept) {
          proposal.acceptedPower += votePower;
        } else {
          proposal.rejectedPower += votePower;
        }
      }

      emit ProposalVoteSubmitted(proposalHash, msg.sender, vote);

      _triggerRegistryEvent(
        abi.encodeCall(
          IACTVotingEvents.ProposalVoteSubmitted,
          (proposalHash, msg.sender, vote)
        )
      );
    } else {
      uint256 oldVotePower = vote.power;

      unchecked {
        if (voteKind == ACTVotingVoteKinds.Accept) {
          proposal.acceptedPower += votePower;
          proposal.rejectedPower -= oldVotePower;
        } else if (voteKind == ACTVotingVoteKinds.Reject) {
          proposal.acceptedPower -= oldVotePower;
          proposal.rejectedPower += votePower;
        }
      }

      emit ProposalVoteUpdated(proposalHash, msg.sender, vote);

      _triggerRegistryEvent(
        abi.encodeCall(
          IACTVotingEvents.ProposalVoteUpdated,
          (proposalHash, msg.sender, vote)
        )
      );
    }

    return true;
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

  function _getVotingPowerAt(
    uint48 epoch,
    address account
  ) internal view returns (uint256) {
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
    ACTVotingProposal memory proposal
  ) private pure returns (ACTVotingProposalStatuses) {
    if (
      proposal.status != ACTVotingProposalStatuses.New || epoch < proposal.epoch
    ) {
      return proposal.status;
    }

    if (epoch == proposal.epoch) {
      return ACTVotingProposalStatuses.Voting;
    }

    return
      proposal.acceptedPower != 0 &&
        proposal.acceptedPower > proposal.rejectedPower
        ? ACTVotingProposalStatuses.Accepted
        : ACTVotingProposalStatuses.Rejected;
  }
}
