import 'hardhat/types/runtime';
import 'hardhat-deploy/dist/types';
import type { Testing } from './Testing';

declare module 'hardhat/types/runtime' {
  export interface HardhatRuntimeEnvironment {
    testing: Testing;
    runScript: (main: () => Promise<void>) => void;
  }
}
declare module 'hardhat-deploy/dist/types' {
  export interface DeploymentsExtension {
    getAddress: (name: string) => Promise<string>;
  }
}
