import { ContractBuildConfig } from './interfaces';

export const HARDHAT_NETWORK = {
  chainId: 31337,
  accounts: {
    mnemonic: 'test test test test test test test test test test test junk',
    count: 10,
  },
};

export const DEFAULT_CONTRACT_BUILD_CONFIG: ContractBuildConfig = {
  address: true,
  abi: true,
};
