import '@nomicfoundation/hardhat-ledger';
import '@nomicfoundation/hardhat-toolbox';
import 'hardhat-deploy';
import { HardhatUserConfig } from 'hardhat/config';
import { buildNetworks, getEnvAsBool } from './hardhat';

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.21',
    settings: {
      metadata: { bytecodeHash: 'none' },
      optimizer: { enabled: true, runs: 10_000 },
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
      chainId: 1,
      type: 'mainnet',
    },
    ethereumGoerli: {
      chainId: 5,
      type: 'testnet',
    },
    optimism: {
      chainId: 10,
      type: 'mainnet',
    },
    optimismGoerli: {
      chainId: 420,
      type: 'testnet',
    },
  }),
  gasReporter: {
    enabled: getEnvAsBool('ENABLED_GAS_REPORTER'),
  },
};

export default config;
