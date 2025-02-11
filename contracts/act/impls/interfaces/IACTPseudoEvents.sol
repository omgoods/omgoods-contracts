// SPDX-License-Identifier: None
pragma solidity 0.8.28;

import {IACTCommonTypes} from "../../common/interfaces/IACTCommonTypes.sol";

/* solhint-disable func-name-mixedcase */

interface IACTPseudoEvents is IACTCommonTypes {
  // pseudo events

  function NameUpdated(string memory name) external view;

  function MaintainerUpdated(address maintainer) external view;

  function StateUpdated(States state) external view;

  function GovernanceModelUpdated(
    GovernanceModels governanceModel
  ) external view;

  function ExtensionUpdated(address extension, bool enabled) external view;

  function ModuleUpdated(
    address module,
    ModuleAccess memory access
  ) external view;
}
