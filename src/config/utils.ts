import { NetworksUserConfig, NetworkUserConfig } from 'hardhat/types';
import { getEnv, getEnvAsUrl, isPrivateKey, prepareAddress } from '../common';
import { NetworkConfig, NetworkType } from './interfaces';
import {
  HARDHAT_NETWORK_CHAIN_ID,
  HARDHAT_NETWORK_ACCOUNTS_MNEMONIC,
} from './constants';

function getCommonNetworkConfig(type: NetworkType): NetworkUserConfig {
  let result: NetworkUserConfig = null;

  let owner = getEnv(type, 'ACCOUNTS_OWNER');
  let deployer = getEnv(type, 'ACCOUNTS_DEPLOYER');
  let accountOwner = getEnv(type, 'ACCOUNTS_ACCOUNT_OWNER');
  let gatewaySender = getEnv(type, 'ACCOUNTS_GATEWAY_SENDER');

  if (owner && deployer && accountOwner && gatewaySender) {
    if (
      isPrivateKey(owner) &&
      isPrivateKey(deployer) &&
      isPrivateKey(accountOwner) &&
      isPrivateKey(gatewaySender)
    ) {
      result = {
        accounts: [owner, deployer, accountOwner, gatewaySender],
      };
    } else {
      owner = prepareAddress(owner);
      deployer = prepareAddress(deployer);
      accountOwner = prepareAddress(accountOwner);
      gatewaySender = prepareAddress(gatewaySender);

      if (owner && deployer && accountOwner && gatewaySender) {
        result = {
          ledgerAccounts: [owner, deployer, accountOwner, gatewaySender],
        };
      }
    }
  }

  return result;
}

export function buildNetworksConfig(
  config: Record<string, NetworkConfig>,
): NetworksUserConfig {
  const result: NetworksUserConfig = {
    hardhat: {
      chainId: HARDHAT_NETWORK_CHAIN_ID,
      accounts: {
        mnemonic: HARDHAT_NETWORK_ACCOUNTS_MNEMONIC,
        count: 10,
      },
    },
    localhost: {
      chainId: HARDHAT_NETWORK_CHAIN_ID,
      url: getEnvAsUrl('RPC_URLS_LOCALHOST') || 'http://localhost:8545',
      accounts: {
        mnemonic: HARDHAT_NETWORK_ACCOUNTS_MNEMONIC,
        count: 4,
      },
      live: false,
    },
  };

  const entries = Object.entries(config);

  const commonConfigs: Record<NetworkType, NetworkUserConfig> = {
    mainnet: getCommonNetworkConfig('mainnet'),
    testnet: getCommonNetworkConfig('testnet'),
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
