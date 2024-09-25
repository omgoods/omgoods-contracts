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

export async function deployDefaultTokenImplMock() {
  const tokenImpl = await deployContract('DefaultTokenImplMock');

  return {
    tokenImpl,
  };
}

export async function deployDefaultTokenFactory() {
  const signers = await getSigners('owner', 'controller');

  const tokenFactory = await deployContract('DefaultTokenFactory', [
    ZeroAddress,
  ]);

  return {
    signers,
    tokenFactory,
  };
}

export async function deployWrappedTokenImplMock() {
  const tokenImpl = await deployContract('WrappedTokenImplMock');

  return {
    tokenImpl,
  };
}

export async function deployWrappedTokenFactory() {
  const signers = await getSigners('owner');

  const tokenFactory = await deployContract('WrappedTokenFactory', [
    ZeroAddress,
  ]);

  return {
    signers,
    tokenFactory,
  };
}

export async function setupDefaultTokenImpl() {
  const { tokenImpl } = await deployDefaultTokenImplMock();

  const result = await setupDefaultTokenFactory({
    tokenImpl,
  });

  const { computeTokenAddress } = result;

  const computeToken = async (symbol: string) =>
    getContractAt('DefaultTokenImplMock', await computeTokenAddress(symbol));

  const token = await computeToken(TOKEN.symbol);

  return {
    token,
    tokenImpl,
    computeToken,
    ...result,
  };
}

export async function setupDefaultTokenFactory(options: {
  tokenImpl: AddressLike;
}) {
  const { tokenImpl } = options;

  const { tokenFactory, signers } = await deployDefaultTokenFactory();

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

export async function setupWrappedTokenImpl() {
  const { externalToken: underlyingToken } = await deployERC20ExternalToken();

  const { tokenImpl } = await deployWrappedTokenImplMock();

  const result = await setupWrappedTokenFactory({
    tokenImpl,
    underlyingToken,
  });

  const { computeTokenAddress } = result;

  const computeToken = async (underlyingToken: AddressLike) =>
    getContractAt(
      'WrappedTokenImplMock',
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

export async function setupWrappedTokenFactory(options: {
  tokenImpl: AddressLike;
  underlyingToken: AddressLike;
}) {
  const { tokenImpl, underlyingToken } = options;

  const { tokenFactory, signers } = await deployWrappedTokenFactory();

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
