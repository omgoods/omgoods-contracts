import 'hardhat/types/runtime';
import 'hardhat-deploy/dist/types';
import type { TransactionResponse } from 'ethers';
import type { Testing, TypedData } from './extensions';

declare module 'hardhat/types/runtime' {
  export interface HardhatRuntimeEnvironment {
    testing: Testing;
    typedData: TypedData;
  }
}

declare module 'hardhat-deploy/dist/types' {
  export interface DeploymentsExtension {
    getAddress: (name: string) => Promise<string>;
    logTx: (
      name: string,
      tx: TransactionResponse | Promise<TransactionResponse>,
    ) => Promise<void>;
  }
}
