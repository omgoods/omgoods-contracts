import type { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-ignition-viem';
import '@nomicfoundation/hardhat-verify';
import '@nomicfoundation/hardhat-viem';
import 'hardhat-gas-reporter';
import 'solidity-coverage';
import '@/config';
import '@/setup';
import '@/tasks';

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.28',
    settings: {
      optimizer: {
        enabled: true,
        runs: 100_000,
      },
    },
  },
  gasReporter: {
    enabled: true,
    offline: true,
    reportFormat: 'legacy',
    darkMode: true,
    reportPureAndViewMethods: true,
  },
};

export default config;
