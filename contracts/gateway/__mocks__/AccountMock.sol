// SPDX-License-Identifier: None
pragma solidity 0.8.21;

import {IERC1271} from "@openzeppelin/contracts/interfaces/IERC1271.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {Ownable} from "../../access/Ownable.sol";

contract AccountMock is IERC1271, Ownable {
  using ECDSA for bytes32;

  // events

  event TransactionExecuted(address to, uint256 value, bytes data);

  // deployment

  constructor(address gateway) {
    _setInitialOwner(address(0));

    _gateway = gateway;
  }

  // external getters

  function isValidSignature(
    bytes32 hash,
    bytes calldata signature
  ) external view returns (bytes4) {
    address signer = hash.recover(signature);

    return
      signer == _owner ? this.isValidSignature.selector : bytes4(0xffffffff);
  }

  // external setters

  function executeTransaction(
    address to,
    uint256 value,
    bytes calldata data
  ) external onlyOwner {
    (bool success, bytes memory response) = to.call{value: value}(data);

    if (!success) {
      // solhint-disable-next-line no-inline-assembly
      assembly {
        revert(add(response, 32), mload(response))
      }
    }

    emit TransactionExecuted(to, value, data);
  }
}
