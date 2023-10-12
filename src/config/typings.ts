import type { NetworkType } from './interfaces';

declare module 'hardhat/types' {
  export interface HardhatNetworkUserConfig {
    type?: NetworkType;
  }

  export interface HardhatNetworkConfig {
    type?: NetworkType;
  }

  export interface HttpNetworkUserConfig {
    type?: NetworkType;
  }

  export interface HttpNetworkConfig {
    type?: NetworkType;
  }
}
