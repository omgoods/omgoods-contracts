import type { ProcessEnvs } from '../common';
import type { Utils } from './Utils';

declare module 'hardhat-deploy/dist/types' {
  export interface DeploymentsExtension {
    getAddress: (name: string) => Promise<string>;
    logHeader: (tag: string, version: string) => void;
  }
}

declare module 'hardhat/types' {
  interface HardhatRuntimeEnvironment {
    processEnvs: ProcessEnvs;
    utils: Utils;
  }
}
