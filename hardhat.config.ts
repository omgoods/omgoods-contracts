import 'dotenv-pre/config';
import '@nomicfoundation/hardhat-ledger';
import '@nomicfoundation/hardhat-toolbox';
import 'hardhat-deploy';
import { createConfig } from './src';

export default createConfig({
  solidity: {
    version: '0.8.21',
    settings: {
      metadata: { bytecodeHash: 'none' },
      optimizer: { enabled: true, runs: 10_000 },
    },
  },
  networks: {
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
  },
});
