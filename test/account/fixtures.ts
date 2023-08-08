import { ethers } from 'hardhat';
import { AddressLike } from 'ethers';

const { deployContract, ZeroAddress } = ethers;

export async function deployAccountRegistry() {
  const accountRegistry = await deployContract('AccountRegistry', [
    ZeroAddress,
  ]);

  return {
    accountRegistry,
  };
}

export async function setupAccountRegistry(
  options: {
    gateway?: AddressLike;
  } = {},
) {
  const { gateway } = {
    gateway: ZeroAddress,
    ...options,
  };

  const { accountRegistry } = await deployAccountRegistry();

  const accountImpl = await deployContract('AccountImpl');

  await accountRegistry.initialize(gateway, accountRegistry, accountImpl);

  return {
    accountRegistry,
    accountImpl,
  };
}
