import { ethers, utils } from 'hardhat';
import {
  AddressLike,
  id,
  keccak256,
  resolveAddress,
  ZeroAddress,
} from 'ethers';
import { deployERC20ExternalToken } from '../erc20/fixtures';
import { setupTokenRegistry } from '../fixtures';
import { TOKEN } from '../constants';

const { computeProxyCloneAddress, getSigners } = utils;

const { deployContract, getContractAt } = ethers;

export async function deployTokenDefaultImplMock() {
  const tokenImpl = await deployContract('TokenDefaultImplMock');

  return {
    tokenImpl,
  };
}

export async function deployTokenDefaultFactory() {
  const signers = await getSigners('owner', 'controller');

  const tokenFactory = await deployContract('TokenDefaultFactory', [
    ZeroAddress,
  ]);

  return {
    signers,
    tokenFactory,
  };
}

export async function deployTokenWrappedImplMock() {
  const tokenImpl = await deployContract('TokenWrappedImplMock');

  return {
    tokenImpl,
  };
}

export async function deployTokenWrappedFactory() {
  const signers = await getSigners('owner');

  const tokenFactory = await deployContract('TokenWrappedFactory', [
    ZeroAddress,
  ]);

  return {
    signers,
    tokenFactory,
  };
}

export async function setupTokenDefaultImpl() {
  const { tokenImpl } = await deployTokenDefaultImplMock();

  const result = await setupTokenDefaultFactory({
    tokenImpl,
  });

  const { computeTokenAddress } = result;

  const computeToken = async (symbol: string) =>
    getContractAt('TokenDefaultImplMock', await computeTokenAddress(symbol));

  const token = await computeToken(TOKEN.symbol);

  return {
    token,
    tokenImpl,
    computeToken,
    ...result,
  };
}

export async function setupTokenDefaultFactory(options: {
  tokenImpl: AddressLike;
}) {
  const { tokenImpl } = options;

  const { tokenFactory, signers } = await deployTokenDefaultFactory();

  const { tokenRegistry } = await setupTokenRegistry({
    tokenFactory,
  });

  await tokenFactory.initialize(ZeroAddress, tokenImpl, tokenRegistry);

  const computeTokenAddress = (symbol: string) =>
    computeProxyCloneAddress(tokenRegistry, tokenImpl, id(symbol));

  await tokenFactory.createToken(
    signers.owner,
    TOKEN.name,
    TOKEN.symbol,
    signers.controller,
    true,
    '0x',
  );

  return {
    signers,
    tokenFactory,
    tokenRegistry,
    computeTokenAddress,
  };
}

export async function setupTokenWrappedImpl() {
  const { externalToken: underlyingToken } = await deployERC20ExternalToken();

  const { tokenImpl } = await deployTokenWrappedImplMock();

  const result = await setupTokenWrappedFactory({
    tokenImpl,
    underlyingToken,
  });

  const { computeTokenAddress } = result;

  const computeToken = async (underlyingToken: AddressLike) =>
    getContractAt(
      'TokenWrappedImplMock',
      await computeTokenAddress(underlyingToken),
    );

  const token = await computeToken(underlyingToken);

  return {
    token,
    tokenImpl,
    underlyingToken,
    computeToken,
    ...result,
  };
}

export async function setupTokenWrappedFactory(options: {
  tokenImpl: AddressLike;
  underlyingToken: AddressLike;
}) {
  const { tokenImpl, underlyingToken } = options;

  const { tokenFactory, signers } = await deployTokenWrappedFactory();

  const { tokenRegistry } = await setupTokenRegistry({
    tokenFactory,
  });

  await tokenFactory.initialize(ZeroAddress, tokenImpl, tokenRegistry);

  const computeTokenAddress = async (underlyingToken: AddressLike) =>
    computeProxyCloneAddress(
      tokenRegistry,
      tokenImpl,
      keccak256(await resolveAddress(underlyingToken)),
    );

  await tokenFactory.createToken(underlyingToken, '0x');

  return {
    signers,
    tokenFactory,
    tokenRegistry,
    computeTokenAddress,
  };
}
