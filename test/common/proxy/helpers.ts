import { AddressLike } from 'ethers';
import { ethers } from 'hardhat';
import { PROXY_IMPL_SLOT } from './constants';

const {
  getContractFactory,
  keccak256,
  concat,
  zeroPadValue,
  getCreate2Address,
  resolveAddress,
  provider,
  AbiCoder,
} = ethers;

export async function createProxyAddressFactory<T = string>(
  proxyFactory: AddressLike,
  proxyImpl: AddressLike,
  prepareSalt: (salt: T) => string = null,
): Promise<(salt: T) => string> {
  const Proxy = await getContractFactory('Proxy');
  const deployer = await resolveAddress(proxyFactory);
  const initCodeHash = keccak256(
    concat([
      Proxy.bytecode,
      zeroPadValue((await resolveAddress(proxyImpl)).toLowerCase(), 32),
    ]),
  );

  return (salt) => {
    const preparedSalt = prepareSalt ? prepareSalt(salt) : (salt as string);

    return getCreate2Address(deployer, preparedSalt, initCodeHash);
  };
}

export async function getProxyImplAddress(
  contract: AddressLike,
): Promise<string> {
  const storage = await provider.getStorage(contract, PROXY_IMPL_SLOT);

  return AbiCoder.defaultAbiCoder().decode(['address'], storage).at(0);
}
