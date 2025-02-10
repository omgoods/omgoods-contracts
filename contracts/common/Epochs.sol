// SPDX-License-Identifier: None
pragma solidity 0.8.28;

library Epochs {
  // structs

  struct Settings {
    uint48 initialTimestamp;
    uint48 windowLength;
  }

  struct Checkpoints {
    Checkpoint[] checkpoints;
  }

  struct Checkpoint {
    uint48 epoch;
    uint208 value;
  }

  // internal getters

  function initEpochSettings(
    uint48 windowLength
  ) internal view returns (Settings memory result) {
    result.initialTimestamp = uint48(block.timestamp);
    result.windowLength = windowLength;

    return result;
  }

  function calcEpoch(
    Settings memory self
  ) internal view returns (uint48 result) {
    uint48 initialTimestamp = self.initialTimestamp;
    uint48 windowLength = self.windowLength;

    if (initialTimestamp != 0 && windowLength != 0) {
      uint48 timestamp = uint48(block.timestamp);

      unchecked {
        result = ((timestamp - initialTimestamp) / windowLength) + 1;
      }
    }

    return result;
  }

  function lookup(
    Checkpoints storage self,
    uint48 epoch,
    uint48 currentEpoch,
    uint256 currentResult
  ) internal view returns (uint256) {
    if (epoch == 0 || epoch > currentEpoch) {
      return 0;
    }

    if (epoch == currentEpoch) {
      return currentResult;
    }

    (bool exists, uint256 result) = lookup(self, epoch);

    return exists ? result : currentResult;
  }

  function lookup(
    Checkpoints storage self,
    uint48 epoch
  ) internal view returns (bool exists, uint256 result) {
    Checkpoint[] storage checkpoints = self.checkpoints;

    uint256 pos = checkpoints.length;

    if (pos == 0) {
      return (false, 0);
    }

    do {
      unchecked {
        --pos;
      }

      Checkpoint memory checkpoint = _unsafeCheckpointAccess(checkpoints, pos);

      if (checkpoint.epoch <= epoch) {
        return (true, uint256(checkpoint.value));
      }
    } while (pos != 0);

    return (true, 0);
  }

  function _unsafeCheckpointAccess(
    Checkpoint[] storage self,
    uint256 pos
  ) private pure returns (Checkpoint storage result) {
    // solhint-disable-next-line no-inline-assembly
    assembly ("memory-safe") {
      mstore(0, self.slot)
      result.slot := add(keccak256(0, 0x20), pos)
    }

    return result;
  }

  // internal setters

  function push(
    Checkpoints storage self,
    uint48 epoch,
    uint256 value
  ) internal {
    if (epoch == 0) {
      return;
    }

    Checkpoint[] storage checkpoints = self.checkpoints;

    uint256 pos = checkpoints.length;
    uint208 value_ = uint208(value);

    if (pos != 0) {
      unchecked {
        --pos;
      }

      Checkpoint storage lastCheckpoint = _unsafeCheckpointAccess(
        checkpoints,
        pos
      );

      if (lastCheckpoint.epoch == epoch) {
        lastCheckpoint.value = value_;
        return;
      }
    }

    Checkpoint memory checkpoint;

    checkpoint.epoch = epoch;
    checkpoint.value = value_;

    checkpoints.push(checkpoint);
  }
}
