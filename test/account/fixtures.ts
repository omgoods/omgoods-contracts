import { ethers, helpers } from 'hardhat';
import { AddressLike } from 'ethers';
import { createProxyAddressFactory } from '../common/proxy/helpers';

const { deployContract, ZeroAddress, getSigners, keccak256 } = ethers;

const { setBalance } = helpers;

export async function deployAccountMock() {
  const accountMock = await deployContract('AccountMock');

  return {
    accountMock,
  };
}

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

export async function deployAccountRegistryMock() {
  const accountRegistryMock = await deployContract('AccountRegistryMock');

  return {
    accountRegistryMock,
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

export async function setupAccountMock() {
  const [owner, gateway, entryPoint] = await getSigners();

  const { accountRegistryMock } = await deployAccountRegistryMock();

  const { accountMock } = await deployAccountMock();

  await accountMock.initialize(gateway, entryPoint, accountRegistryMock);

  await accountRegistryMock.addAccountOwner(accountMock, owner);

  await setBalance(accountMock);

  return {
    accountMock,
    accountRegistryMock,
  };
}
