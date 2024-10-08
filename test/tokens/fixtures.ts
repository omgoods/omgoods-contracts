import { ethers, utils } from 'hardhat';
import { AddressLike, BytesLike, ZeroAddress } from 'ethers';
import { createTypedDataHelper, TYPED_DATA_DOMAIN_NAME } from '../common';

const { randomHex, computeProxyCloneAddress, getSigners } = utils;

const { deployContract, getContractAt } = ethers;

export async function deployTokenMock() {
  const token = await deployContract('TokenMock');

  return {
    token,
  };
}

export async function deployTokenImplMock() {
  const tokenImpl = await deployContract('TokenImplMock');

  return {
    tokenImpl,
  };
}

export async function deployTokenFactoryMock() {
  const signers = await getSigners('owner');

  const tokenFactory = await deployContract('TokenFactoryMock');

  return {
    signers,
    tokenFactory,
  };
}

export async function deployTokenRegistry() {
  const signers = await getSigners(
    'owner',
    'guardian',
    'token',
    'tokenFactory',
  );

  const tokenRegistry = await deployContract('TokenRegistry', [
    ZeroAddress,
    TYPED_DATA_DOMAIN_NAME,
  ]);

  return {
    signers,
    tokenRegistry,
  };
}

export async function setupTokenMock() {
  const { token } = await deployTokenMock();

  const { tokenRegistry, signers } = await setupTokenRegistry({
    token,
  });

  await token.initialize(ZeroAddress, tokenRegistry, true);

  return {
    signers,
    token,
    tokenRegistry,
  };
}

export async function setupTokenFactoryMock() {
  const { tokenFactory } = await deployTokenFactoryMock();

  const { tokenRegistry, tokenImpl, typedDataHelper, signers } =
    await setupTokenRegistry({
      tokenFactory,
    });

  const computeTokenAddress = (salt: BytesLike) =>
    computeProxyCloneAddress(tokenRegistry, tokenImpl, salt);

  const computeToken = async (salt: BytesLike) =>
    getContractAt('TokenImplMock', await computeTokenAddress(salt));

  await tokenFactory.initialize(ZeroAddress, tokenImpl, tokenRegistry);

  const salt = randomHex();

  await tokenFactory.createToken(
    salt,
    tokenImpl.interface.encodeFunctionData('initialize', [ZeroAddress, false]),
    '0x',
  );

  const token = await computeToken(salt);

  return {
    signers,
    token,
    tokenImpl,
    tokenFactory,
    tokenRegistry,
    computeToken,
    computeTokenAddress,
    typedDataHelper,
  };
}

export async function setupTokenRegistry(options?: {
  token?: AddressLike;
  tokenFactory?: AddressLike;
}) {
  const { tokenImpl } = await deployTokenImplMock();

  const { signers, tokenRegistry } = await deployTokenRegistry();

  const typedDataHelper = await createTypedDataHelper<{
    Token: {
      tokenImpl: string;
      initCode: BytesLike;
    };
  }>(tokenRegistry, {
    Token: [
      {
        name: 'tokenImpl',
        type: 'address',
      },
      {
        name: 'initCode',
        type: 'bytes',
      },
    ],
  });

  await tokenRegistry.initialize(ZeroAddress, [signers.guardian]);

  await tokenRegistry.addToken(signers.token);

  await tokenRegistry.addTokenFactory(signers.tokenFactory);

  if (options?.token) {
    await tokenRegistry.addToken(options.token);
  }

  if (options?.tokenFactory) {
    await tokenRegistry.addTokenFactory(options.tokenFactory);
  }

  const computeTokenAddress = (tokenImpl: AddressLike, salt: BytesLike) =>
    computeProxyCloneAddress(tokenRegistry, tokenImpl, salt);

  return {
    tokenImpl,
    tokenRegistry,
    signers,
    typedDataHelper,
    computeTokenAddress,
  };
}
