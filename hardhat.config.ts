import type { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-ignition';
import '@nomicfoundation/hardhat-ignition-viem';
import '@nomicfoundation/hardhat-verify';
import '@nomicfoundation/hardhat-viem';
import 'hardhat-abi-exporter';
import 'hardhat-gas-reporter';
import 'solidity-coverage';
import '@/config';

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
  abiExporter: {
    clear: true,
    format: 'minimal',
    only: ['contracts/act'],
    rename: (sourceName) => sourceName.slice(10, -4),
  },
};

export default config;
