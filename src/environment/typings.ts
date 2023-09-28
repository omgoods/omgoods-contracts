import 'hardhat-deploy/dist/types';
import type { ContractTransactionResponse } from 'ethers';

declare module 'hardhat-deploy/dist/types' {
  export interface DeploymentsExtension {
    logTx: (
      name: string,
      methodName: string,
      tx: Promise<ContractTransactionResponse>,
    ) => Promise<void>;
  }
}
