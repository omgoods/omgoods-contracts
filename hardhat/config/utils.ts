import { NetworksUserConfig, NetworkUserConfig } from 'hardhat/types';
import { isHexString } from 'ethers';
import { prepareAddress, getEnv, getEnvAsInt, getEnvAsUrl } from '../common';
import { NetworkConfig, NetworkType } from './interfaces';
import { HARDHAT_NETWORK } from './constants';

function buildCommonNetwork(type: NetworkType): NetworkUserConfig {
  let result: NetworkUserConfig = null;

  let owner = getEnv(type, 'ACCOUNTS_OWNER');
  let deployer = getEnv(type, 'ACCOUNTS_DEPLOYER');

  if (owner && deployer) {
    if (isHexString(owner, 32) && isHexString(deployer, 32)) {
      result = {
        accounts: [owner, deployer],
      };
    } else {
      owner = prepareAddress(owner);
      deployer = prepareAddress(deployer);

      if (owner && deployer) {
        result = {
          ledgerAccounts: [owner, deployer],
        };
      }
    }
  }

  if (!result) {
    const mnemonic = getEnv(type, 'ACCOUNTS_MNEMONIC');

    if (mnemonic) {
      result = {
        accounts: {
          mnemonic,
          path: getEnv(type, 'ACCOUNTS_PATH'),
          initialIndex: getEnvAsInt(type, 'ACCOUNTS_INITIAL_INDEX'),
          count: 2,
        },
      };
    }
  }

  return result;
}

export function buildNetworks(
  config: Record<string, NetworkConfig>,
): NetworksUserConfig {
  const result: NetworksUserConfig = {
    hardhat: HARDHAT_NETWORK,
    localhost: {
      ...HARDHAT_NETWORK,
      url: getEnvAsUrl('RPC_URLS_LOCALHOST'),
      live: false,
    },
  };

  const entries = Object.entries(config);

  const commonConfigs: Record<NetworkType, NetworkUserConfig> = {
    mainnet: buildCommonNetwork('mainnet'),
    testnet: buildCommonNetwork('testnet'),
  };

  for (const [name, config] of entries) {
    const { type, ...custom } = config;

    const url = getEnvAsUrl('RPC_URLS_', name);
    const common = commonConfigs[type];

    if (url && common) {
      result[name] = {
        url,
        ...common,
        ...custom,
        live: true,
      };
    }
  }

  return result;
}
