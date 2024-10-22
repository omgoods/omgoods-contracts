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

export default createConfig({
  solidity: {
    version: '0.8.27',
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
