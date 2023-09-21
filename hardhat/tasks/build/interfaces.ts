import { TypedDataDomain, TypedDataField } from 'ethers';

export interface ContractBuild {
  addresses?: Record<string, string>;
  typedData?: {
    domain: TypedDataDomain;
    types: Record<string, Array<TypedDataField>>;
  };
  abi?: any[];
  byteCode?: string;
  buildFile?: string;
  buildName?: string;
}
