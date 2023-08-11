import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';

export type Signers<K extends string> = Record<K, HardhatEthersSigner> & {
  unknown: HardhatEthersSigner[];
};
