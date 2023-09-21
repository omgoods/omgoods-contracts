import { HttpNetworkUserConfig } from 'hardhat/types';
import { TypedDataDomain, TypedDataField } from 'ethers';

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

export interface ContractTypedDataConfig {
  domain: Required<Pick<TypedDataDomain, 'name' | 'version'>>;
  types: Record<string, Array<TypedDataField>>;
}

export interface ContractConfig<B = ContractBuildConfig> {
  typedData?: ContractTypedDataConfig;
  build?: B;
}
