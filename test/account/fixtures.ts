import { ethers, helpers } from 'hardhat';
import { AddressLike } from 'ethers';

const { deployContract, ZeroAddress, keccak256, getContractAt } = ethers;

const { setBalance, buildSigners, randomAddress, createProxyAddressFactory } =
  helpers;

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
  const signers = await buildSigners('owner', 'gateway', 'entryPoint');

  const accountRegistry = await deployContract('AccountRegistry', [
    ZeroAddress,
  ]);

  return {
    accountRegistry,
    signers,
  };
}

export async function deployAccountRegistryMock() {
  const accountRegistryMock = await deployContract('AccountRegistryMock');

  return {
    accountRegistryMock,
  };
}

export async function setupAccount() {
  const { accountRegistry, accountImpl, signers, accounts } =
    await setupAccountRegistry();

  const account = await getContractAt('AccountImpl', accounts.created.address);

  return {
    account,
    accountImpl,
    accountRegistry,
    signers: {
      ...signers,
      owner: accounts.created.owner,
    },
  };
}

export async function setupAccountMock() {
  const signers = await buildSigners('owner', 'gateway', 'entryPoint');

  const { accountRegistryMock } = await deployAccountRegistryMock();

  const { accountMock } = await deployAccountMock();

  await accountMock.initialize(
    signers.gateway,
    signers.entryPoint,
    accountRegistryMock,
  );

  await accountRegistryMock.addAccountOwner(accountMock, signers.owner);

  await setBalance(accountMock);

  return {
    accountMock,
    accountRegistryMock,
    signers,
  };
}

export async function setupAccountRegistry(
  options: {
    gateway?: AddressLike;
    entryPoint?: AddressLike;
  } = {},
) {
  const { accountRegistry, signers } = await deployAccountRegistry();

  const { gateway, entryPoint } = {
    gateway: signers.gateway,
    entryPoint: signers.entryPoint,
    ...options,
  };

  const { accountImpl } = await deployAccountImpl();

  await accountRegistry.initialize(gateway, entryPoint, accountImpl);

  const computeAccountAddress = await createProxyAddressFactory(
    accountRegistry,
    accountImpl,
    (owner) => keccak256(owner),
  );

  const accounts: Record<
    'created' | 'defined' | 'unknown',
    {
      address: string;
      owner: typeof signers.owner;
    }
  > = {
    created: {
      address: computeAccountAddress(signers.unknown.at(0).address),
      owner: signers.unknown.at(0),
    },
    defined: {
      address: computeAccountAddress(signers.unknown.at(1).address),
      owner: signers.unknown.at(1),
    },
    unknown: {
      address: computeAccountAddress(signers.unknown.at(2).address),
      owner: signers.unknown.at(2),
    },
  };

  await accountRegistry.forceAccountCreation(accounts.created.owner);

  await accountRegistry
    .connect(accounts.defined.owner)
    .addAccountOwner(accounts.defined.address, randomAddress());

  return {
    accountRegistry,
    accountImpl,
    computeAccountAddress,
    signers,
    accounts,
  };
}
