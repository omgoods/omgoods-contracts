import { ethers, testing, typedData } from 'hardhat';
import { createProxyAddressFactory } from '../../../common';
import {
  setupERC20TokenRegistry,
  deployERC20ExternalTokenMock,
} from '../fixtures';
import { ERC20_WRAPPED_TOKEN, ERC20_UNDERLYING_TOKEN } from './constants';

const { deployContract, ZeroAddress, keccak256, getContractAt, MaxUint256 } =
  ethers;

const { buildSigners } = testing;

const { getDomainArgs, createEncoder } = typedData;

export async function deployERC20WrappedTokenImpl() {
  const tokenImpl = await deployContract('ERC20WrappedTokenImpl');

  return {
    tokenImpl,
  };
}

export async function deployERC20WrappedTokenFactory() {
  const signers = await buildSigners('owner');

  const tokenFactory = await deployContract('ERC20WrappedTokenFactory', [
    ZeroAddress,
    ...getDomainArgs('ERC20WrappedTokenFactory'),
  ]);

  return {
    tokenFactory,
    signers,
  };
}

export async function setupERC20WrappedToken() {
  const signers = await buildSigners('guardian', 'owner');

  const { tokenFactory, computeTokenAddress, typedDataEncoder } =
    await setupERC20WrappedTokenFactory();

  const underlyingToken = await deployERC20ExternalTokenMock(
    ERC20_UNDERLYING_TOKEN,
    signers.owner,
  );

  const token = await getContractAt(
    'ERC20WrappedTokenImpl',
    computeTokenAddress(await underlyingToken.getAddress()),
    signers.owner,
  );

  await tokenFactory.createToken(
    underlyingToken,
    await typedDataEncoder.sign(signers.guardian, 'Token', {
      underlyingToken: await underlyingToken.getAddress(),
    }),
  );

  await underlyingToken.approve(token, MaxUint256);

  await token.deposit(ERC20_WRAPPED_TOKEN.initialSupply);

  return {
    tokenFactory,
    token,
    underlyingToken,
    signers,
  };
}

export async function setupERC20WrappedTokenFactory() {
  const { tokenImpl } = await deployERC20WrappedTokenImpl();

  const { signers, tokenFactory } = await deployERC20WrappedTokenFactory();

  const { tokenRegistry } = await setupERC20TokenRegistry({
    tokenFactory,
  });

  const underlyingToken = await deployERC20ExternalTokenMock(
    ERC20_UNDERLYING_TOKEN,
    signers.owner,
  );

  const underlyingTokenWithInvalidDecimals = await deployERC20ExternalTokenMock(
    {
      decimals: 5,
    },
    signers.owner,
  );

  await tokenFactory.initialize(ZeroAddress, tokenRegistry, tokenImpl);

  const computeTokenAddress = await createProxyAddressFactory(
    tokenRegistry,
    tokenImpl,
    (owner) => keccak256(owner),
  );

  const typedDataEncoder = await createEncoder<{
    Token: {
      underlyingToken: string;
    };
  }>('ERC20WrappedTokenFactory', tokenFactory);

  return {
    underlyingToken: await underlyingToken.getAddress(),
    underlyingTokenWithInvalidDecimals:
      await underlyingTokenWithInvalidDecimals.getAddress(),
    tokenRegistry,
    tokenFactory,
    computeTokenAddress,
    typedDataEncoder,
    signers,
  };
}
