// SPDX-License-Identifier: None
pragma solidity 0.8.28;

import {StorageSlot} from "@openzeppelin/contracts/utils/StorageSlot.sol";
import {ACTSettings} from "../../core/structs.sol";
import {ACTImpl} from "../ACTImpl.sol";
import {IACTFungible} from "./interfaces/IACTFungible.sol";
import {IACTFungibleEvents} from "./interfaces/IACTFungibleEvents.sol";

/**
 * @title ACTFungibleImpl
 */
contract ACTFungibleImpl is IACTFungible, ACTImpl {
  // slots

  bytes32 private constant ALLOWANCE_SLOT =
    keccak256(abi.encodePacked("act.fungible#allowance"));

  // errors

  error InsufficientAllowance();

  // deployment

  constructor() ACTImpl() {
    //
  }

  // external getters

  /**
   * @notice Returns the number of decimal places used for token values.
   * @return The number of decimals (18).
   */
  function decimals() external pure returns (uint8) {
    return 18;
  }

  /**
   * @notice Returns the remaining number of tokens that `spender` is allowed to spend
   * on behalf of `owner`.
   * @param owner The address of the token owner.
   * @param spender The address of the spender.
   * @return The remaining allowance of `spender` for `owner`.
   */
  function allowance(
    address owner,
    address spender
  ) external view returns (uint256) {
    return _getAllowanceSlot(owner, spender).value;
  }

  /**
   * @notice Approves `spender` to spend up to `value` tokens on behalf of the caller.
   * @param spender The address authorized to spend.
   * @param value The number of tokens `spender` is allowed to spend.
   * @return True if the operation was successful.
   * @dev Emits an {Approval} event and a {FungibleApproval} registry event.
   */
  function approve(address spender, uint256 value) external returns (bool) {
    require(spender != address(0), ZeroAddressSpender());

    address owner = msg.sender;

    _getAllowanceSlot(owner, spender).value = value;

    _emitApprovalEvent(owner, spender, value);

    return true;
  }

  /**
   * @notice Transfers `value` tokens from the caller's account to the address `to`.
   * @param to The recipient address.
   * @param value The amount of tokens to transfer.
   * @return True if the operation was successful.
   * @dev Emits a {Transfer} event and a {FungibleTransfer} registry event.
   */
  function transfer(address to, uint256 value) external returns (bool) {
    ACTSettings memory settings = _getSettings();

    require(to != address(0), ZeroAddressReceiver());

    if (value == 0) {
      // nothing to do
      return false;
    }

    uint48 epoch = _getEpoch(settings);
    address from = msg.sender;

    _transferAt(epoch, from, to, value);

    _emitTransferEvent(epoch, from, to, value);

    return true;
  }

  /**
   * @notice Transfers `value` tokens from the account `from` to the address `to`.
   * @param from The account to transfer tokens from.
   * @param to The account to transfer tokens to.
   * @param value The amount of tokens to transfer.
   * @return True if the operation was successful.
   * @dev Emits a {Transfer} event and a {FungibleTransfer} registry event.
   *      Checks that the caller has permission (allowance) to transfer the tokens,
   *      if not called by an operator module.
   */
  function transferFrom(
    address from,
    address to,
    uint256 value
  ) external returns (bool) {
    ACTSettings memory settings = _getSettings();

    require(from != address(0), ZeroAddressSender());
    require(to != address(0), ZeroAddressReceiver());

    if (value == 0) {
      // If the value to transfer is 0, no action is needed
      return false;
    }

    if (!_isOperatorModuleCall()) {
      address spender = msg.sender; // Retrieve the address of the current caller

      // Get the storage slot tracking the allowance for the spender on the owner's (from) tokens
      StorageSlot.Uint256Slot storage fromAllowanceSlot = _getAllowanceSlot(
        from,
        spender
      );

      uint256 fromAllowance = fromAllowanceSlot.value; // Retrieve the current allowance

      if (fromAllowance != type(uint256).max) {
        require(fromAllowance >= value, InsufficientAllowance()); // Ensure the allowance is sufficient for the transaction

        unchecked {
          fromAllowanceSlot.value = fromAllowance - value; // Deduct the transferred value from the allowance
        }

        // Emit an approval event to reflect the updated allowance
        _emitApprovalEvent(from, spender, fromAllowance);
      }
    }

    uint48 epoch = _getEpoch(settings);

    _transferAt(epoch, from, to, value); // Perform the token transfer at the specified epoch

    _emitTransferEvent(epoch, from, to, value);

    return true;
  }

  /**
   * @notice Mints `value` tokens to the specified address `to`.
   * @param to The address that will receive the minted tokens.
   * @param value The amount of tokens to mint.
   * @return True if the minting operation was successful.
   * @dev Emits a {Transfer} event and a {FungibleTransfer} registry event.
   *      Requires the caller to be an authorized minter module or the contract owner.
   */
  function mint(address to, uint256 value) external returns (bool) {
    ACTSettings memory settings = _getSettings();

    if (!_isMinterModuleCall()) {
      _requireOnlyOwner(settings);
    }

    require(to != address(0), ZeroAddressReceiver());

    if (value == 0) {
      // nothing to do
      return false;
    }

    uint48 epoch = _getEpoch(settings);

    _transferAt(epoch, address(0), to, value);

    _emitTransferEvent(epoch, address(0), to, value);

    return true;
  }

  /**
   * @notice Burns `value` tokens from the specified address `from`.
   * @param from The address from which tokens will be burned.
   * @param value The amount of tokens to burn.
   * @return True if the burn operation was successful.
   * @dev Emits a {Transfer} event and a {FungibleTransfer} registry event.
   *      Requires the caller to be an authorized burner module or the contract owner.
   */
  function burn(address from, uint256 value) external returns (bool) {
    ACTSettings memory settings = _getSettings();

    if (!_isBurnerModuleCall()) {
      _requireOnlyOwner(settings);
    }

    require(from != address(0), ZeroAddressSender());

    if (value == 0) {
      // nothing to do
      return false;
    }

    uint48 epoch = _getEpoch(settings);

    _transferAt(epoch, from, address(0), value);

    _emitTransferEvent(epoch, from, address(0), value);

    return true;
  }

  // private setters

  function _getAllowanceSlot(
    address owner,
    address spender
  ) private pure returns (StorageSlot.Uint256Slot storage) {
    return
      StorageSlot.getUint256Slot(
        keccak256(abi.encodePacked(ALLOWANCE_SLOT, owner, spender)) //
      );
  }

  function _emitApprovalEvent(
    address owner,
    address spender,
    uint256 value
  ) private {
    emit Approval(owner, spender, value);

    _triggerRegistryEvent(
      abi.encodeCall(
        IACTFungibleEvents.FungibleApproval,
        (owner, spender, value)
      )
    );
  }

  function _emitTransferEvent(
    uint48 epoch,
    address from,
    address to,
    uint256 value
  ) private {
    emit Transfer(from, to, value);

    _triggerRegistryEvent(
      abi.encodeCall(
        IACTFungibleEvents.FungibleTransfer,
        (epoch, from, to, value)
      )
    );
  }
}
