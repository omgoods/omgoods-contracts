import 'hardhat/types/runtime';
import 'hardhat-deploy/dist/types';
import type { TypedDataDomain } from 'ethers';
import type { Testing } from './Testing';

declare module 'hardhat/types/runtime' {
  export interface HardhatRuntimeEnvironment {
    testing: Testing;
    getTypedDataDomain: (contract: string) => TypedDataDomain;
  }
}

declare module 'hardhat-deploy/dist/types' {
  export interface DeploymentsExtension {
    getAddress: (name: string) => Promise<string>;
  }
}
