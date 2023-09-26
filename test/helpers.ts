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
} from 'ethers';

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
>(options: {
  domain: {
    name: string;
    version: string;
    verifyingContract: AddressLike;
  };
  types: Record<P, Array<TypedDataField>>;
}): Promise<{
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

  const {
    domain: { name, version, verifyingContract },
    types,
  } = options;

  const domain: TypedDataDomain = {
    chainId,
    name,
    version,
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

export async function createProxyCloneAddressFactory<T = string>(
  proxyFactory: AddressLike,
  proxyImpl: AddressLike,
  prepareSalt: (salt: T) => BytesLike = null,
): Promise<(salt: T) => string> {
  const deployer = await resolveAddress(proxyFactory);
  const initCodeHash = keccak256(
    concat([
      '0x3d602d80600a3d3981f3363d3d373d3d3d363d73000000',
      (await resolveAddress(proxyImpl)).toLowerCase(),
      '0x5af43d82803e903d91602b57fd5bf3',
    ]),
  );

  return (salt) =>
    getCreate2Address(
      deployer,
      prepareSalt ? prepareSalt(salt) : (salt as BytesLike),
      initCodeHash,
    );
}
