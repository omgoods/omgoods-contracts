import { ethers } from 'hardhat';

const { deployContract, ZeroAddress } = ethers;

export async function deployAccountRegistry(
  options: {
    owner?: string | Promise<string>;
  } = {},
) {
  const { owner } = {
    owner: ZeroAddress,
    ...options,
  };

  const accountRegistry = await deployContract('AccountRegistry', [owner]);

  return {
    accountRegistry,
  };
}

export async function setupAccountRegistry(
  options: {
    gateway?: string | Promise<string>;
  } = {},
) {
  const { gateway } = {
    gateway: ZeroAddress,
    ...options,
  };

  const { accountRegistry } = await deployAccountRegistry();

  const accountImplementation = await deployContract('Account');

  await accountRegistry.initialize(
    gateway,
    accountRegistry.getAddress(),
    accountImplementation.getAddress(),
  );

  return {
    accountRegistry,
    accountImplementation,
  };
}
