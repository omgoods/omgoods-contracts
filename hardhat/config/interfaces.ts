import { HttpNetworkUserConfig } from 'hardhat/types';

export type NetworkType = 'mainnet' | 'testnet';

export type NetworkConfig = Pick<
  HttpNetworkUserConfig,
  'gas' | 'gasMultiplier' | 'gasPrice' | 'timeout'
> & {
  type: NetworkType;
  chainId: number;
};
