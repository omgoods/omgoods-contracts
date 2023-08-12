import { ethers, helpers } from 'hardhat';
import { AddressLike } from 'ethers';
import { createProxyAddressFactory } from '../common/proxy/helpers';

const { deployContract, ZeroAddress, keccak256, getContractAt } = ethers;

const { setBalance, buildSigners, randomAddress } = helpers;

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
  const { accountRegistry, signers, createdAccount, createdAccountOwner } =
    await setupAccountRegistry();

  const account = await getContractAt('AccountImpl', createdAccount);

  return {
    account,
    accountRegistry,
    signers: {
      ...signers,
      owner: createdAccountOwner,
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

  const [createdAccountOwner, definedAccountOwner, unknownAccountOwner] =
    signers.unknown;

  const createdAccount = computeAccountAddress(createdAccountOwner.address);
  const definedAccount = computeAccountAddress(definedAccountOwner.address);
  const unknownAccount = computeAccountAddress(unknownAccountOwner.address);

  await accountRegistry.forceAccountCreation(createdAccountOwner);

  await accountRegistry
    .connect(definedAccountOwner)
    .addAccountOwner(definedAccount, randomAddress());

  return {
    accountRegistry,
    accountImpl,
    computeAccountAddress,
    signers,
    createdAccountOwner,
    definedAccountOwner,
    unknownAccountOwner,
    createdAccount,
    definedAccount,
    unknownAccount,
  };
}
