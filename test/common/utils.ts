import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';
import { network } from 'hardhat';
import {
  TypedDataDomain,
  TypedDataEncoder,
  TypedDataField,
  AddressLike,
  resolveAddress,
} from 'ethers';
import { TYPED_DATA_DOMAIN_NAME } from './constants';

export async function createTypedDataHelper<
  D extends Record<string, Record<string, any>>,
  P extends keyof D = keyof D,
>(
  verifyingContract: AddressLike,
  types: Record<P, Array<TypedDataField>>,
): Promise<{
  encode: (primaryType: P, data: D[P]) => string;
  hash: (primaryType: P, data: D[P]) => string;
  sign: (
    signer: HardhatEthersSigner,
    primaryType: P,
    data: D[P],
  ) => Promise<string>;
}> {
  const {
    config: { chainId },
  } = network;

  const domain: TypedDataDomain = {
    name: TYPED_DATA_DOMAIN_NAME,
    version: '1',
    chainId,
    verifyingContract: await resolveAddress(verifyingContract),
  };

  const getTypes = (primaryType: P) => ({
    [primaryType]: types[primaryType as string],
  });

  return {
    encode: (primaryType, data) =>
      TypedDataEncoder.encode(domain, getTypes(primaryType), data),
    hash: (primaryType, data) =>
      TypedDataEncoder.hash(domain, getTypes(primaryType), data),
    sign: async (signer, primaryType, data) =>
      signer.signTypedData(domain, getTypes(primaryType), data),
  };
}
