import type { HardhatUserConfig } from 'hardhat/config';
import type { AbiExporterUserConfig } from 'hardhat-abi-exporter';
import '@nomicfoundation/hardhat-ignition';
import '@nomicfoundation/hardhat-ignition-viem';
import '@nomicfoundation/hardhat-verify';
import '@nomicfoundation/hardhat-viem';
import 'hardhat-abi-exporter';
import 'hardhat-chai-matchers-viem';
import 'hardhat-gas-reporter';
import 'solidity-coverage';
import '@/config';

const abiExporter: AbiExporterUserConfig = {
  clear: true,
  only: [
    // act
    'contracts/act/registry/ACTRegistry.sol',
    'contracts/act/extensions/signer/ACTSignerExtension.sol',
    'contracts/act/extensions/wallet/ACTWalletExtension.sol',
    'contracts/act/impls/fungible/ACTFungibleImpl.sol',
    'contracts/act/impls/non-fungible/ACTNonFungibleImpl.sol',
    // erc4337
    '@account-abstraction/contracts/core/EntryPoint.sol',
  ],
  rename: (_, contractName) => contractName,
};

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
    enabled: process.env.ENABLED_GAS_REPORTER === '1',
    offline: true,
    reportFormat: 'legacy',
    darkMode: true,
    reportPureAndViewMethods: true,
  },
  abiExporter: [
    {
      path: './abi/minimal',
      format: 'minimal',
      ...abiExporter,
    },
    {
      path: './abi/full',
      ...abiExporter,
    },
  ],
};

export default config;
