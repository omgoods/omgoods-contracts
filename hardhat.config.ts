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
    // localnets
    local: {
      chainId: 900,
      type: 'localnet',
    },
    localOp: {
      chainId: 901,
      type: 'localnet',
    },
    // mainnets
    eth: {
      chainId: 1,
      type: 'mainnet',
    },
    op: {
      chainId: 10,
      type: 'mainnet',
    },
    bnb: {
      chainId: 56,
      type: 'mainnet',
    },
    // testnets
    ethSepolia: {
      chainId: 11155111,
      type: 'testnet',
    },
    opSepolia: {
      chainId: 11155420,
      type: 'testnet',
    },
    bnbTestnet: {
      chainId: 97,
      type: 'testnet',
    },
  },
});

export default config;
