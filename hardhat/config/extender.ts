import { extendConfig } from 'hardhat/config';
import { ContractBuildConfig } from './interfaces';
import { DEFAULT_CONTRACT_BUILD_CONFIG } from './constants';

extendConfig((config, userConfig) => {
  const { contracts } = userConfig;

  config.contracts = Object.entries(contracts).reduce(
    (result, [name, contract]) => {
      const { build: userBuild, ...common } = contract;

      let build: ContractBuildConfig = null;

      if (userBuild) {
        switch (typeof userBuild) {
          case 'boolean':
            build = DEFAULT_CONTRACT_BUILD_CONFIG;
            break;

          case 'object':
            build = {
              ...DEFAULT_CONTRACT_BUILD_CONFIG,
              ...userBuild,
            };
            break;
        }
      }

      return {
        ...result,
        [name]: {
          ...common,
          build,
        },
      };
    },
    {},
  );
});
