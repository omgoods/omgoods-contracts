// SPDX-License-Identifier: None
pragma solidity 0.8.28;

interface IACTSignerTypes {
  // enums

  enum SignatureModes {
    Unknown, // 0
    Infinity, // 1
    TimestampBase // 2
  }

  // structs

  struct Signature {
    SignatureModes mode;
    uint48 validAfter;
    uint48 validUntil;
  }
}
