import 'dotenv-pre/config';
import '@nomicfoundation/hardhat-chai-matchers';
import '@nomicfoundation/hardhat-ethers';
import '@nomicfoundation/hardhat-ledger';
import '@nomicfoundation/hardhat-network-helpers';
import '@typechain/hardhat';
import 'hardhat-deploy';
import 'hardhat-gas-reporter';
import 'solidity-coverage';
import { createConfig } from './src';

const config = createConfig({
  solidity: {
    version: '0.8.27',
    settings: {
      metadata: { bytecodeHash: 'none' },
      optimizer: { enabled: true, runs: 10_000 },
    },
  },
  tokens: {
    externalKeys: ['A', 'B', 'C', 'D', 'E'],
  },
  networks: {
    local: {
      chainId: 900,
      type: 'localnet',
    },
    localOptimism: {
      chainId: 901,
      type: 'localnet',
    },
    ethereum: {
      chainId: 1,
      type: 'mainnet',
    },
    ethereumOptimism: {
      chainId: 10,
      type: 'mainnet',
    },
    sepolia: {
      chainId: 11155111,
      type: 'testnet',
    },
    sepoliaOptimism: {
      chainId: 11155420,
      type: 'testnet',
    },
  },
});

export default config;
