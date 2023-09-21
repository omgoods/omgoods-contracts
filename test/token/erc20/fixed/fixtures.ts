import { ethers, testing, typedData } from 'hardhat';
import { BigNumberish } from 'ethers';
import { createProxyAddressFactory } from '../../../common';
import { setupERC20TokenRegistry } from '../fixtures';
import { ERC20_FIXED_TOKEN } from './constants';

const { deployContract, ZeroAddress, id, getContractAt } = ethers;

const { buildSigners } = testing;

const { getDomainArgs, createEncoder } = typedData;

export async function deployERC20FixedTokenImpl() {
  const tokenImpl = await deployContract('ERC20FixedTokenImpl');

  return {
    tokenImpl,
  };
}

export async function deployERC20FixedTokenFactory() {
  const signers = await buildSigners('owner');

  const tokenFactory = await deployContract('ERC20FixedTokenFactory', [
    ZeroAddress,
    ...getDomainArgs('ERC20FixedTokenFactory'),
  ]);

  return {
    tokenFactory,
    signers,
  };
}

export async function setupERC20FixedToken() {
  const signers = await buildSigners('guardian', 'owner');

  const { tokenFactory, computeTokenAddress, typedDataEncoder } =
    await setupERC20FixedTokenFactory();

  const token = await getContractAt(
    'ERC20FixedTokenImpl',
    computeTokenAddress(ERC20_FIXED_TOKEN.symbol),
    signers.owner,
  );

  const tokenData = {
    ...ERC20_FIXED_TOKEN,
    owner: signers.owner.address,
  };

  await tokenFactory.createToken(
    tokenData,
    await typedDataEncoder.sign(signers.guardian, 'Token', tokenData),
  );

  return {
    tokenFactory,
    token,
    tokenData,
    signers,
  };
}

export async function setupERC20FixedTokenFactory() {
  const { tokenImpl } = await deployERC20FixedTokenImpl();

  const { signers, tokenFactory } = await deployERC20FixedTokenFactory();

  const { tokenRegistry } = await setupERC20TokenRegistry({
    tokenFactory,
  });

  await tokenFactory.initialize(ZeroAddress, tokenRegistry, tokenImpl);

  const computeTokenAddress = await createProxyAddressFactory(
    tokenRegistry,
    tokenImpl,
    (symbol) => id(symbol),
  );

  const typedDataEncoder = await createEncoder<{
    Token: {
      name: string;
      symbol: string;
      owner: string;
      totalSupply: BigNumberish;
    };
  }>('ERC20FixedTokenFactory', tokenFactory);

  return {
    tokenRegistry,
    tokenFactory,
    computeTokenAddress,
    typedDataEncoder,
    signers,
  };
}
