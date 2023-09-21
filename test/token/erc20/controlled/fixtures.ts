import { ethers, testing, typedData } from 'hardhat';
import { BigNumberish } from 'ethers';
import { createProxyAddressFactory } from '../../../common';
import { setupERC20TokenRegistry } from '../fixtures';
import { ERC20_CONTROLLED_TOKEN } from './constants';

const { deployContract, ZeroAddress, id, getContractAt } = ethers;

const { buildSigners } = testing;

const { getDomainArgs, createEncoder } = typedData;

export async function deployERC20ControlledTokenImpl() {
  const tokenImpl = await deployContract('ERC20ControlledTokenImpl');

  return {
    tokenImpl,
  };
}

export async function deployERC20ControlledTokenFactory() {
  const signers = await buildSigners('owner');

  const tokenFactory = await deployContract('ERC20ControlledTokenFactory', [
    ZeroAddress,
    ...getDomainArgs('ERC20ControlledTokenFactory'),
  ]);

  return {
    tokenFactory,
    signers,
  };
}

export async function setupERC20ControlledToken() {
  const signers = await buildSigners('guardian', 'owner', 'minter', 'burner');

  const { tokenFactory, computeTokenAddress, typedDataEncoder } =
    await setupERC20ControlledTokenFactory();

  const token = await getContractAt(
    'ERC20ControlledTokenImpl',
    computeTokenAddress(ERC20_CONTROLLED_TOKEN.symbol),
    signers.owner,
  );

  const tokenData = {
    ...ERC20_CONTROLLED_TOKEN,
    owner: signers.owner.address,
    minter: signers.minter.address,
    burner: signers.burner.address,
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

export async function setupERC20ControlledTokenFactory() {
  const { tokenImpl } = await deployERC20ControlledTokenImpl();

  const { signers, tokenFactory } = await deployERC20ControlledTokenFactory();

  const { tokenRegistry } = await setupERC20TokenRegistry({
    tokenFactory: tokenFactory,
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
      minter: string;
      burner: string;
      initialSupply: BigNumberish;
    };
  }>('ERC20ControlledTokenFactory', tokenFactory);

  return {
    tokenRegistry,
    tokenFactory,
    computeTokenAddress,
    typedDataEncoder,
    signers,
  };
}
