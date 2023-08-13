import { AddressLike } from 'ethers';
import { ethers } from 'hardhat';
import { PROXY_IMPL_SLOT } from './constants';

const { provider, AbiCoder } = ethers;

export async function getProxyImplAddress(
  contract: AddressLike,
): Promise<string> {
  const storage = await provider.getStorage(contract, PROXY_IMPL_SLOT);

  return AbiCoder.defaultAbiCoder().decode(['address'], storage).at(0);
}
