import 'hardhat-deploy';
import '@nomicfoundation/hardhat-toolbox';
import { HardhatUserConfig } from 'hardhat/config';
import './src';

const { ENABLED_GAS_REPORTER } = process.env;

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.21',
    settings: {
      metadata: { bytecodeHash: 'none' },
      optimizer: { enabled: true, runs: 100 },
    },
  },
  networks: {
    hardhat: {
      accounts: {
        count: 10,
      },
    },
  },
  namedAccounts: {
    owner: 0,
    deployer: 1,
    accountOwner: 2,
  },
  paths: {
    artifacts: '.hardhat/artifacts',
    cache: '.hardhat/cache',
    sources: 'contracts',
  },
  typechain: {
    outDir: 'typechain',
  },
  gasReporter: {
    enabled: !!parseInt(ENABLED_GAS_REPORTER, 10),
  },
};

export default config;
