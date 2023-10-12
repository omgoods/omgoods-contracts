import type { ProcessEnvs } from '../common';

declare module 'hardhat-deploy/dist/types' {
  export interface DeploymentsExtension {
    getAddress: (name: string) => Promise<string>;
  }
}

declare module 'hardhat/types' {
  interface HardhatRuntimeEnvironment {
    processEnvs: ProcessEnvs;
  }
}
