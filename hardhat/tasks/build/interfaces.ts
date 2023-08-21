import { TypedDataDomain } from 'ethers';

export interface ContractBuild {
  addresses?: Record<string, string>;
  typeDataDomain?: TypedDataDomain;
  abi?: any[];
  byteCode?: string;
  buildFile?: string;
  buildName?: string;
}
