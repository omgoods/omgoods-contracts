import 'hardhat/types/config';
import type { ContractConfig, ContractBuildConfig } from './interfaces';

declare module 'hardhat/types/config' {
  export interface HardhatUserConfig {
    contracts: Record<string, ContractConfig<boolean | ContractBuildConfig>>;
  }

  export interface HardhatConfig {
    contracts: Record<string, ContractConfig>;
  }
}
