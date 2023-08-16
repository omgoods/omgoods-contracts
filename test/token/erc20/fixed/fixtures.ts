import { ethers, helpers } from 'hardhat';
import { BigNumberish } from 'ethers';
import { setupERC20TokenRegistry } from '../fixtures';
import {
  ERC20_FIXED_TOKEN_FACTORY_TYPED_DATA_DOMAIN,
  ERC20_FIXED_TOKEN_DATA,
} from './constants';

const { deployContract, ZeroAddress, id, getContractAt } = ethers;

const { buildSigners, createProxyAddressFactory, createTypedDataEncoder } =
  helpers;

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
    ERC20_FIXED_TOKEN_FACTORY_TYPED_DATA_DOMAIN.name,
    ERC20_FIXED_TOKEN_FACTORY_TYPED_DATA_DOMAIN.version,
  ]);

  return {
    tokenFactory,
    signers,
  };
}

export async function setupERC20FixedToken() {
  const signers = await buildSigners('guardian', 'owner');

  const { tokenFactory, computeTokenAddress, tokenTypeEncoder } =
    await setupERC20FixedTokenFactory();

  const token = await getContractAt(
    'ERC20FixedTokenImpl',
    computeTokenAddress(ERC20_FIXED_TOKEN_DATA.symbol),
    signers.owner,
  );

  const tokenData = {
    ...ERC20_FIXED_TOKEN_DATA,
    owner: signers.owner.address,
  };

  await tokenFactory.createToken(
    tokenData,
    await signers.guardian.signTypedData(
      tokenTypeEncoder.domain,
      tokenTypeEncoder.types,
      tokenData,
    ),
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

  const tokenTypeEncoder = await createTypedDataEncoder<{
    name: string;
    symbol: string;
    owner: string;
    totalSupply: BigNumberish;
  }>(tokenFactory, ERC20_FIXED_TOKEN_FACTORY_TYPED_DATA_DOMAIN, {
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
        name: 'totalSupply',
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
