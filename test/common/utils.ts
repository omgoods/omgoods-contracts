import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';
import { ethers, network } from 'hardhat';
import {
  hexlify,
  randomBytes,
  getAddress,
  TypedDataDomain,
  TypedDataEncoder,
  TypedDataField,
  AddressLike,
  resolveAddress,
  keccak256,
  concat,
  BytesLike,
  getCreate2Address,
  BigNumberish,
} from 'ethers';
import { TYPED_DATA_DOMAIN_NAME } from './constants';
import { time } from '@nomicfoundation/hardhat-network-helpers';

export function randomHex(bytesSize = 32): string {
  return hexlify(randomBytes(bytesSize));
}

export function randomAddress(): string {
  return getAddress(randomHex(20));
}

export async function getSigners<
  K extends string,
  R extends Record<K, HardhatEthersSigner> & {
    unknown: HardhatEthersSigner[];
  },
>(...names: Array<K>): Promise<R> {
  const { getSigners } = ethers;

  const signers = await getSigners();

  const named = names.reduce((result, name, index) => {
    return {
      ...result,
      [name]: signers.at(index),
    };
  }, {});

  return {
    ...named,
    unknown: signers.slice(names.length),
  } as R;
}

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

export async function computeProxyCloneAddress(
  deployer: AddressLike,
  impl: AddressLike,
  salt: BytesLike,
): Promise<string> {
  return getCreate2Address(
    await resolveAddress(deployer),
    salt,
    keccak256(
      concat([
        '0x3d602d80600a3d3981f3363d3d373d3d3d363d73',
        (await resolveAddress(impl)).toLowerCase(),
        '0x5af43d82803e903d91602b57fd5bf3',
      ]),
    ),
  );
}

export async function isBlockTimestamp(value: BigNumberish): Promise<boolean> {
  return BigInt(await time.latest()) === BigInt(value);
}
