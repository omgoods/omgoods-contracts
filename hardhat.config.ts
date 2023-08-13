import 'hardhat-deploy';
import '@nomicfoundation/hardhat-toolbox';
import { HardhatUserConfig } from 'hardhat/config';
import './src';

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.20',
    settings: {
      metadata: { bytecodeHash: 'none' },
      optimizer: { enabled: true, runs: 100 },
    },
  },
  namedAccounts: {
    owner: 0,
    deployer: 1,
  },
  paths: {
    artifacts: '.hardhat/artifacts',
    cache: '.hardhat/cache',
    sources: 'contracts',
  },
  typechain: {
    outDir: 'typechain',
  },
};

export default config;
