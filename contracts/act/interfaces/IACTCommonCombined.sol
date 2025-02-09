// SPDX-License-Identifier: None
pragma solidity 0.8.28;

import {IACTSigner} from "../extensions/signer/interfaces/IACTSigner.sol";
import {IACTWallet} from "../extensions/wallet/interfaces/IACTWallet.sol";
import {IACTCommon} from "../impls/interfaces/IACTCommon.sol";

/* solhint-disable no-empty-blocks */

interface IACTCommonCombined is IACTSigner, IACTWallet, IACTCommon {
  //
}
