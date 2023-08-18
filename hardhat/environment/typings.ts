import 'hardhat/types/runtime';
import type { Testing } from './Testing';

declare module 'hardhat/types/runtime' {
  export interface HardhatRuntimeEnvironment {
    testing: Testing;
  }
}
