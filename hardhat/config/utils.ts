import { NetworksUserConfig, NetworkUserConfig } from 'hardhat/types';
import { DeterministicDeploymentInfo } from 'hardhat-deploy/types';
import { isHexString } from 'ethers';
import { prepareAddress, getEnv, getEnvAsInt, getEnvAsUrl } from '../common';
import { NetworkConfig, NetworkType } from './interfaces';
import { HARDHAT_NETWORK } from './constants';

function getCommonNetwork(type: NetworkType): NetworkUserConfig {
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

export function createConfigNetworks(
  config: Record<string, NetworkConfig>,
): NetworksUserConfig {
  const result: NetworksUserConfig = {
    hardhat: HARDHAT_NETWORK,
    localhost: {
      ...HARDHAT_NETWORK,
      url: getEnvAsUrl('LOCALHOST_URL'),
      live: false,
    },
  };

  const configEntries = Object.entries(config);

  const commonConfigs: Record<NetworkType, NetworkUserConfig> = {
    mainnet: getCommonNetwork('mainnet'),
    testnet: getCommonNetwork('testnet'),
  };

  for (const [name, config] of configEntries) {
    const { type, ...custom } = config;

    const url = getEnvAsUrl(name, 'URL');
    const common = commonConfigs[type];

    if (url && common) {
      result[name] = {
        url,
        ...common,
        ...custom,
        live: true,
        verify: {
          etherscan: {
            apiKey: getEnv(name, 'ETHERSCAN_API_KEY'),
          },
        },
      };
    }
  }

  return result;
}

export function getDeterministicDeploymentConfig(): (
  chainId: string,
) => DeterministicDeploymentInfo {
  return () => {
    // TODO: add own deployment factory
    // https://github.com/wighawag/hardhat-deploy#4-deterministicdeployment-ability-to-specify-a-deployment-factory

    return {
      deployer: '0x3fab184622dc19b6109349b94811493bf2a45362',
      factory: '0x4e59b44847b379578588920ca78fbf26c0b4956c',
      funding: '10000000000000000',
      signedTx:
        '0xf8a58085174876e800830186a08080b853604580600e600039806000f350fe7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe03601600081602082378035828234f58015156039578182fd5b8082525050506014600cf31ba02222222222222222222222222222222222222222222222222222222222222222a02222222222222222222222222222222222222222222222222222222222222222',
    };
  };
}
