import type { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-verify';
import '@nomicfoundation/hardhat-viem';
import '@nomicfoundation/hardhat-ignition-viem';
import 'hardhat-gas-reporter';
import 'solidity-coverage';
import './src';

const config: HardhatUserConfig = {
  solidity: '0.8.28',
  gasReporter: {
    enabled: true,
    offline: true,
    reportFormat: 'legacy',
  },
};

export default config;
