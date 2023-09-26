import { HardhatUserConfig } from 'hardhat/config';
import { NetworksUserConfig, NetworkUserConfig } from 'hardhat/types';
import {
  isHexString,
  computeAddress,
  HDNodeWallet,
  Mnemonic,
  getIndexedAccountPath,
} from 'ethers';
import {
  prepareAddress,
  getEnv,
  getEnvAsInt,
  getEnvAsUrl,
  getEnvAsBool,
} from '../common';
import { NetworkConfig, NetworkType } from './interfaces';
import { HARDHAT_NETWORK } from './constants';

function getNetworkAccountsConfig(type: NetworkType): NetworkUserConfig {
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
          initialIndex: getEnvAsInt(type, 'ACCOUNTS_INITIAL_INDEX'),
          count: 2,
        },
      };
    }
  }

  return result;
}

export function createNetworksConfig(
  config: Record<string, NetworkConfig>,
): NetworksUserConfig {
  const result: NetworksUserConfig = {
    hardhat: HARDHAT_NETWORK,
    localhost: {
      ...HARDHAT_NETWORK,
      url: getEnvAsUrl('LOCALHOST_URL'),
    },
  };

  const configEntries = Object.entries(config);

  const commonNetworkAccountsConfigs = {
    mainnet: getNetworkAccountsConfig('mainnet'),
    testnet: getNetworkAccountsConfig('testnet'),
  };

  for (const [name, config] of configEntries) {
    const { type, ...custom } = config;

    const url = getEnvAsUrl(name, 'URL');
    const accountsConfig = commonNetworkAccountsConfigs[type];

    if (url && accountsConfig) {
      result[name] = {
        url,
        ...accountsConfig,
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

export function createNamedAccountsConfig(
  networks: NetworksUserConfig,
): HardhatUserConfig['namedAccounts'] {
  const result: Record<'owner' | 'deployer', Record<number, string>> = {
    owner: {},
    deployer: {},
  };

  const networksValues = Object.values(networks);

  try {
    for (const { chainId, accounts, ledgerAccounts } of networksValues) {
      if (result.owner[chainId]) {
        continue;
      }

      let addresses: string[] = [];

      if (ledgerAccounts) {
        addresses = ledgerAccounts;
      } else if (Array.isArray(accounts)) {
        addresses = (accounts as Array<string>).map((privateKey) =>
          computeAddress(privateKey),
        );
      } else if (accounts && typeof accounts === 'object') {
        const { mnemonic, initialIndex } = {
          initialIndex: 0,
          ...accounts,
        };

        const toIndex = initialIndex + 2;

        for (let index = initialIndex; index < toIndex; index++) {
          const { address } = HDNodeWallet.fromMnemonic(
            Mnemonic.fromPhrase(mnemonic),
            getIndexedAccountPath(index),
          );

          addresses.push(address);
        }
      }

      if (addresses.length === 2) {
        result.owner[chainId] = addresses[0];
        result.deployer[chainId] = addresses[1];
      }
    }
  } catch (err) {
    console.error(err);
  }

  return result;
}

export function createConfig(
  config: Omit<HardhatUserConfig, 'networks'> & {
    networks: Record<string, NetworkConfig>;
  },
): HardhatUserConfig {
  const { networks: networksConfig, ...custom } = config;

  const networks = createNetworksConfig(networksConfig);
  const namedAccounts = createNamedAccountsConfig(networks);

  return {
    ...custom,
    networks,
    namedAccounts,
    typechain: {
      outDir: 'typechain',
    },
    gasReporter: {
      enabled: getEnvAsBool('ENABLED_GAS_REPORTER'),
    },
    deterministicDeployment: () => {
      // TODO: add own deployment factory
      // https://github.com/wighawag/hardhat-deploy#4-deterministicdeployment-ability-to-specify-a-deployment-factory

      return {
        deployer: '0x3fab184622dc19b6109349b94811493bf2a45362',
        factory: '0x4e59b44847b379578588920ca78fbf26c0b4956c',
        funding: '10000000000000000',
        signedTx:
          '0xf8a58085174876e800830186a08080b853604580600e600039806000f350fe7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe03601600081602082378035828234f58015156039578182fd5b8082525050506014600cf31ba02222222222222222222222222222222222222222222222222222222222222222a02222222222222222222222222222222222222222222222222222222222222222',
      };
    },
  };
}
