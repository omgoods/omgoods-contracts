import { ethers, testing } from 'hardhat';
import { BigNumberish } from 'ethers';
import { createProxyAddressFactory } from '../../../common';
import { setupERC20TokenRegistry } from '../fixtures';
import {
  ERC20_CONTROLLED_TOKEN_FACTORY_TYPED_DATA_DOMAIN,
  ERC20_CONTROLLED_TOKEN,
} from './constants';

const { deployContract, ZeroAddress, id, getContractAt } = ethers;

const { buildSigners, createTypedDataEncoder } = testing;

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
    ERC20_CONTROLLED_TOKEN_FACTORY_TYPED_DATA_DOMAIN.name,
    ERC20_CONTROLLED_TOKEN_FACTORY_TYPED_DATA_DOMAIN.version,
  ]);

  return {
    tokenFactory,
    signers,
  };
}

export async function setupERC20ControlledToken() {
  const signers = await buildSigners('guardian', 'owner', 'minter', 'burner');

  const { tokenFactory, computeTokenAddress, tokenTypeEncoder } =
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
    await tokenTypeEncoder.sign(signers.guardian, tokenData),
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

  const tokenTypeEncoder = await createTypedDataEncoder<{
    name: string;
    symbol: string;
    owner: string;
    minter: string;
    burner: string;
    initialSupply: BigNumberish;
  }>(tokenFactory, ERC20_CONTROLLED_TOKEN_FACTORY_TYPED_DATA_DOMAIN, {
    Token: [
      {
        name: 'name',
        type: 'string',
      },
      {
        name: 'symbol',
        type: 'string',
      },
      {
        name: 'owner',
        type: 'address',
      },
      {
        name: 'minter',
        type: 'address',
      },
      {
        name: 'burner',
        type: 'address',
      },
      {
        name: 'initialSupply',
        type: 'uint256',
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
