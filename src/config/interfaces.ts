import { HttpNetworkUserConfig } from 'hardhat/types';

export type NetworkType = 'mainnet' | 'testnet' | 'localnet';

export type NetworkConfig = Pick<
  HttpNetworkUserConfig,
  'gas' | 'gasMultiplier' | 'gasPrice' | 'timeout' | 'type' | 'chainId'
>;
