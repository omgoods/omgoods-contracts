import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';
import { TypedDataDomain } from 'ethers';

export type Signers<K extends string> = Record<K, HardhatEthersSigner> & {
  unknown: HardhatEthersSigner[];
};

export interface TypedDataEncoder<
  D extends Record<string, Record<string, any>>,
  P extends keyof D = keyof D,
> {
  domain: TypedDataDomain;
  encode: (primaryType: P, data: D[P]) => string;
  hash: (primaryType: P, data: D[P]) => string;
  sign: (
    signer: HardhatEthersSigner | string,
    primaryType: P,
    data: D[P],
  ) => Promise<string>;
}
