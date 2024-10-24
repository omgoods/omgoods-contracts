import { HardhatUserConfig } from 'hardhat/config';
import { NetworksUserConfig, NetworkUserConfig } from 'hardhat/types';
import {
  computeAddress,
  HDNodeWallet,
  Mnemonic,
  getIndexedAccountPath,
} from 'ethers';
import { processEnvs } from '../common';
import { NetworkConfig, NetworkType } from './interfaces';
import { HARDHAT_NETWORK } from './constants';

function getNetworkAccountsConfig(type: NetworkType): NetworkUserConfig {
  let result: NetworkUserConfig = null;

  let owner = processEnvs.getHex32(type, 'ACCOUNTS_OWNER');
  let deployer = processEnvs.getHex32(type, 'ACCOUNTS_DEPLOYER');
  let faucet = processEnvs.getHex32(type, 'ACCOUNTS_FAUCET');

  if (owner && deployer) {
    const accounts: string[] = [owner, deployer];

    if (faucet) {
      accounts.push(faucet);
    }

    result = {
      accounts,
    };
  } else {
    owner = processEnvs.getAddress(type, 'ACCOUNTS_OWNER');
    deployer = processEnvs.getAddress(type, 'ACCOUNTS_DEPLOYER');
    faucet = processEnvs.getAddress(type, 'ACCOUNTS_FAUCET');

    if (owner && deployer) {
      const ledgerAccounts: string[] = [owner, deployer];

      if (faucet) {
        ledgerAccounts.push(faucet);
      }

      result = {
        ledgerAccounts,
      };
    }
  }

  if (!result) {
    const mnemonic = processEnvs.getRaw(type, 'ACCOUNTS_MNEMONIC');

    if (mnemonic) {
      result = {
        accounts: {
          mnemonic,
          initialIndex: processEnvs.getInt(type, 'ACCOUNTS_INITIAL_INDEX'),
          count: 3,
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
      url: processEnvs.getUrl('LOCALHOST_URL'),
    },
  };

  const configEntries = Object.entries(config);

  const commonNetworkAccountsConfigs = {
    mainnet: getNetworkAccountsConfig('mainnet'),
    testnet: getNetworkAccountsConfig('testnet'),
  };

  for (const [name, config] of configEntries) {
    const { type, ...custom } = config;

    const url = processEnvs.getUrl(name, 'URL');
    const accountsConfig = commonNetworkAccountsConfigs[type];

    if (url && accountsConfig) {
      result[name] = {
        url,
        ...accountsConfig,
        ...custom,
        live: true,
        type,
        verify: {
          etherscan: {
            apiKey: processEnvs.getRaw(name, 'ETHERSCAN_API_KEY'),
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
  const result: Record<
    'owner' | 'deployer' | 'faucet',
    Record<number, string>
  > = {
    owner: {},
    deployer: {},
    faucet: {},
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

        const toIndex = initialIndex + 3;

        for (let index = initialIndex; index < toIndex; index++) {
          const { address } = HDNodeWallet.fromMnemonic(
            Mnemonic.fromPhrase(mnemonic),
            getIndexedAccountPath(index),
          );

          addresses.push(address);
        }
      }

      if (addresses.length === 3) {
        result.owner[chainId] = addresses[0];
        result.deployer[chainId] = addresses[1];
        result.faucet[chainId] = addresses[2];
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
      enabled: processEnvs.getBool('ENABLED_GAS_REPORTER'),
    },
  };
}
