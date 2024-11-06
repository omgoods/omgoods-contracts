import { HttpNetworkUserConfig } from 'hardhat/types';

export type NetworkType = 'mainnet' | 'testnet' | 'localnet';

export type NetworkConfig = Pick<
  HttpNetworkUserConfig,
  'gasMultiplier' | 'gasPrice' | 'type' | 'chainId'
>;
