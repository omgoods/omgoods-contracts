import 'hardhat-deploy/dist/types';

declare module 'hardhat-deploy/dist/types' {
  export interface DeploymentsExtension {
    getAddress: (name: string) => Promise<string>;
  }
}
