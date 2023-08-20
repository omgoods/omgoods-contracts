import { HttpNetworkUserConfig } from 'hardhat/types';
import { TypedDataDomain } from 'ethers';

export type NetworkType = 'mainnet' | 'testnet';

export type NetworkConfig = Pick<
  HttpNetworkUserConfig,
  'gas' | 'gasMultiplier' | 'gasPrice' | 'timeout'
> & {
  type: NetworkType;
  chainId: number;
};

export interface ContractBuildConfig {
  name?: string;
  address?: boolean;
  abi?: boolean;
  byteCode?: boolean;
}

export interface ContractConfig<B = ContractBuildConfig> {
  typeDataDomain?: Required<Pick<TypedDataDomain, 'name' | 'version'>>;
  build?: B;
}
