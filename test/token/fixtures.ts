import { ethers, testsUtils, proxyUtils } from 'hardhat';

const { deployContract, ZeroAddress, hashMessage } = ethers;

const { createAddressFactory } = proxyUtils;

const { buildSigners, randomHex, randomAddress } = testsUtils;

export async function deployTokenMock() {
  const signers = await buildSigners('owner');

  const tokenMock = await deployContract('TokenMock');

  return {
    tokenMock,
    signers,
  };
}

export async function deployTokenFactoryMock() {
  const signers = await buildSigners('owner');

  const tokenFactoryMock = await deployContract('TokenFactoryMock');

  return {
    tokenFactoryMock,
    signers,
  };
}

export async function deployTokenReceiverMock() {
  const tokenReceiverMock = await deployContract('TokenReceiverMock');

  return {
    tokenReceiverMock,
  };
}

export async function deployTokenRegistryMock() {
  const signers = await buildSigners(
    'owner',
    'guardian',
    'token',
    'tokenFactory',
  );
  const tokenRegistryMock = await deployContract('TokenRegistryMock');

  return {
    tokenRegistryMock,
    signers,
  };
}

export async function setupTokenMock() {
  const { tokenMock, signers } = await deployTokenMock();
  const { tokenRegistryMock } = await deployTokenRegistryMock();

  await tokenMock.initialize(ZeroAddress, tokenRegistryMock);

  await tokenRegistryMock.addToken(tokenMock);

  return {
    tokenMock,
    tokenRegistryMock,
    signers,
  };
}

export async function setupTokenFactoryMock() {
  const { tokenMock } = await deployTokenMock();
  const { tokenRegistryMock } = await deployTokenRegistryMock();
  const { tokenFactoryMock, signers } = await deployTokenFactoryMock();

  await tokenFactoryMock.initialize(ZeroAddress, tokenRegistryMock, tokenMock);

  await tokenRegistryMock.addTokenFactory(tokenFactoryMock);

  const computeTokenAddress = await createAddressFactory(
    tokenRegistryMock,
    tokenMock,
  );

  return {
    tokenMock,
    tokenFactoryMock,
    tokenRegistryMock,
    computeTokenAddress,
    signers,
  };
}

export async function setupTokenRegistryMock() {
  const { tokenRegistryMock, signers } = await deployTokenRegistryMock();

  await tokenRegistryMock.initialize([signers.guardian]);

  await tokenRegistryMock.addToken(signers.token);

  await tokenRegistryMock.addTokenFactory(signers.tokenFactory);

  const existingTokenFactory = randomAddress();

  await tokenRegistryMock.addTokenFactory(existingTokenFactory);

  const existingToken = {
    impl: randomAddress(),
    salt: randomHex(),
  };

  const initMessage = randomHex();
  const initHash = hashMessage(initMessage);

  await tokenRegistryMock
    .connect(signers.tokenFactory)
    .createToken(
      existingToken.impl,
      existingToken.salt,
      initHash,
      await signers.owner.signMessage(initMessage),
    );

  return {
    tokenRegistryMock,
    existingToken,
    existingTokenFactory,
    signers,
  };
}
