// SPDX-License-Identifier: None
pragma solidity 0.8.21;

import {IERC1271} from "@openzeppelin/contracts/interfaces/IERC1271.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {Context} from "@openzeppelin/contracts/utils/Context.sol";
import {Ownable} from "../../common/access/Ownable.sol";
import {GatewayRecipient} from "../GatewayRecipient.sol";

contract ERC1271AccountMock is IERC1271, Ownable, GatewayRecipient {
  using ECDSA for bytes32;

  // events

  event TransactionExecuted(address to, uint256 value, bytes data);

  // deployment

  constructor(address gateway) Ownable(address(0)) {
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

  // internal getters

  function _msgSender()
    internal
    view
    virtual
    override(Context, GatewayRecipient)
    returns (address)
  {
    return GatewayRecipient._msgSender();
  }
}