import { NetworksUserConfig, NetworkUserConfig } from 'hardhat/types';
import { isHexString } from 'ethers';
import { commonUtils } from '../common';
import { envsUtils } from '../envs';
import { NetworkConfig, NetworkType } from './interfaces';
import { HARDHAT_NETWORK } from './constants';

const { getAddress } = commonUtils;

const { getRaw, getAsUrl, getAsInt } = envsUtils;

function buildCommonNetwork(type: NetworkType): NetworkUserConfig {
  let result: NetworkUserConfig = null;

  let owner = getRaw(type, 'ACCOUNTS_OWNER');
  let deployer = getRaw(type, 'ACCOUNTS_DEPLOYER');

  if (owner && deployer) {
    if (isHexString(owner, 32) && isHexString(deployer, 32)) {
      result = {
        accounts: [owner, deployer],
      };
    } else {
      owner = getAddress(owner);
      deployer = getAddress(deployer);

      if (owner && deployer) {
        result = {
          ledgerAccounts: [owner, deployer],
        };
      }
    }
  }

  if (!result) {
    const mnemonic = getRaw(type, 'ACCOUNTS_MNEMONIC');

    if (mnemonic) {
      result = {
        accounts: {
          mnemonic,
          path: getRaw(type, 'ACCOUNTS_PATH'),
          initialIndex: getAsInt(type, 'ACCOUNTS_INITIAL_INDEX'),
          count: getAsInt(type, 'ACCOUNTS_COUNT'),
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
      url: getAsUrl('RPC_URLS_LOCALHOST'),
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

    const url = getAsUrl('RPC_URLS_', name);
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
