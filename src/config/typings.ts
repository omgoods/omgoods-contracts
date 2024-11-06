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

  export interface HardhatTokensConfig {
    externalKeys?: string[];
  }

  export interface HardhatConfig {
    tokens?: HardhatTokensConfig;
  }

  export interface HardhatUserConfig {
    tokens?: HardhatTokensConfig;
  }
}
