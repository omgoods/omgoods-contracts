// SPDX-License-Identifier: None
pragma solidity 0.8.28;

interface IACTWalletTypes {
  // structs

  struct Transaction {
    address to;
    uint256 value;
    bytes data;
  }
}
