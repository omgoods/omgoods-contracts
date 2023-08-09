import { ethers } from 'hardhat';
import { AddressLike } from 'ethers';
import { createProxyAddressFactory } from '../common/proxy/helpers';

const {
  deployContract,
  ZeroAddress,
  getSigners,
  resolveAddress,
  getContractAt,
  keccak256,
} = ethers;

export async function deployAccountImpl() {
  const accountImpl = await deployContract('AccountImpl');

  return {
    accountImpl,
  };
}

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
    entryPoint?: AddressLike;
  } = {},
) {
  const { gateway, entryPoint } = {
    gateway: ZeroAddress,
    entryPoint: ZeroAddress,
    ...options,
  };

  const { accountRegistry } = await deployAccountRegistry();
  const { accountImpl } = await deployAccountImpl();

  await accountRegistry.initialize(gateway, entryPoint, accountImpl);

  const computeAccountAddress = await createProxyAddressFactory(
    accountRegistry,
    accountImpl,
    (owner) => keccak256(owner),
  );

  return {
    accountRegistry,
    accountImpl,
    computeAccountAddress,
  };
}

export async function setupAccountImpl() {
  const [saltOwner, gateway, entryPoint] = await getSigners();

  const { accountRegistry, computeAccountAddress } = await setupAccountRegistry(
    {
      gateway,
      entryPoint,
    },
  );

  const accountImpl = await getContractAt(
    'AccountImpl',
    computeAccountAddress(await resolveAddress(saltOwner)),
  );

  await accountRegistry.forceAccountCreation(saltOwner);

  return {
    accountImpl,
    accountRegistry,
  };
}
