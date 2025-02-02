// SPDX-License-Identifier: None
pragma solidity 0.8.28;

enum ACTVariants {
  Fungible, // 0
  NonFungible // 1
}

enum ACTStates {
  Locked, // 0
  Active, // 1
  Tracked // 2
}

enum ACTSystems {
  AbsoluteMonarchy, // 0
  ConstitutionalMonarchy, // 1
  Democracy // 2
}
