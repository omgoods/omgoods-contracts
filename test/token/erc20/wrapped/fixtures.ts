import { ethers, proxyUtils, testsUtils, typeDataUtils } from 'hardhat';
import {
  setupERC20TokenRegistry,
  deployERC20ExternalTokenMock,
} from '../fixtures';
import {
  ERC20_WRAPPED_TOKEN_FACTORY_TYPED_DATA_DOMAIN,
  ERC20_WRAPPED_TOKEN_DATA,
  ERC20_UNDERLYING_TOKEN_DATA,
} from './constants';

const { deployContract, ZeroAddress, keccak256, getContractAt, MaxUint256 } =
  ethers;

const { createAddressFactory } = proxyUtils;
const { createEncoder } = typeDataUtils;

const { buildSigners } = testsUtils;

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
    ERC20_WRAPPED_TOKEN_FACTORY_TYPED_DATA_DOMAIN.name,
    ERC20_WRAPPED_TOKEN_FACTORY_TYPED_DATA_DOMAIN.version,
  ]);

  return {
    tokenFactory,
    signers,
  };
}

export async function setupERC20WrappedToken() {
  const signers = await buildSigners('guardian', 'owner');

  const { tokenFactory, computeTokenAddress, tokenTypeEncoder } =
    await setupERC20WrappedTokenFactory();

  const underlyingToken = await deployERC20ExternalTokenMock(
    ERC20_UNDERLYING_TOKEN_DATA,
    signers.owner,
  );

  const token = await getContractAt(
    'ERC20WrappedTokenImpl',
    computeTokenAddress(await underlyingToken.getAddress()),
    signers.owner,
  );

  await tokenFactory.createToken(
    underlyingToken,
    await tokenTypeEncoder.sign(signers.guardian, {
      underlyingToken: await underlyingToken.getAddress(),
    }),
  );

  await underlyingToken.approve(token, MaxUint256);

  await token.deposit(ERC20_WRAPPED_TOKEN_DATA.initialSupply);

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

  await tokenFactory.initialize(ZeroAddress, tokenRegistry, tokenImpl);

  const computeTokenAddress = await createAddressFactory(
    tokenRegistry,
    tokenImpl,
    (owner) => keccak256(owner),
  );

  const tokenTypeEncoder = await createEncoder<{
    underlyingToken: string;
  }>(tokenFactory, ERC20_WRAPPED_TOKEN_FACTORY_TYPED_DATA_DOMAIN, {
    Token: [
      {
        name: 'underlyingToken',
        type: 'address',
      },
    ],
  });

  return {
    tokenRegistry,
    tokenFactory,
    computeTokenAddress,
    tokenTypeEncoder,
    signers,
  };
}
