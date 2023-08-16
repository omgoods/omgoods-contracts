import '@nomicfoundation/hardhat-ledger';
import '@nomicfoundation/hardhat-toolbox';
import 'hardhat-deploy';
import { HardhatUserConfig } from 'hardhat/config';
import { configUtils, envsUtils } from './src';

const { buildNetworks } = configUtils;

const { getAsBool } = envsUtils;

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.21',
    settings: {
      metadata: { bytecodeHash: 'none' },
      optimizer: { enabled: true, runs: 2 ** 32 - 1 },
    },
  },
  paths: {
    artifacts: '.hardhat/artifacts',
    cache: '.hardhat/cache',
  },
  typechain: {
    outDir: 'typechain',
  },
  namedAccounts: {
    owner: 0,
    deployer: 1,
  },
  networks: buildNetworks({
    ethereum: {
      type: 'mainnet',
      chainId: 1,
    },
    ethereumGoerli: {
      type: 'testnet',
      chainId: 5,
    },
    optimism: {
      type: 'mainnet',
      chainId: 10,
    },
    optimismGoerli: {
      type: 'testnet',
      chainId: 420,
    },
    base: {
      type: 'mainnet',
      chainId: 8453,
    },
    baseGoerli: {
      type: 'testnet',
      chainId: 84531,
    },
  }),
  gasReporter: {
    enabled: getAsBool('ENABLED_GAS_REPORTER'),
  },
};

export default config;
