import { ethers, helpers } from 'hardhat';
import { AddressLike, BigNumberish } from 'ethers';
import { setupERC20TokenRegistry } from '../fixtures';
import { RC20_CONTROLLED_TOKEN_FACTORY_TYPED_DATA_DOMAIN } from './constants';

const { deployContract, ZeroAddress, id } = ethers;

const { buildSigners, createProxyAddressFactory, createTypedDataEncoder } =
  helpers;

export async function deployERC20ControlledTokenImpl() {
  const erc20ControlledTokenImpl = await deployContract(
    'ERC20ControlledTokenImpl',
  );

  return {
    erc20ControlledTokenImpl,
  };
}

export async function deployERC20ControlledTokenFactory() {
  const signers = await buildSigners('owner');

  const erc20ControlledTokenFactory = await deployContract(
    'ERC20ControlledTokenFactory',
    [
      ZeroAddress,
      RC20_CONTROLLED_TOKEN_FACTORY_TYPED_DATA_DOMAIN.name,
      RC20_CONTROLLED_TOKEN_FACTORY_TYPED_DATA_DOMAIN.version,
    ],
  );

  return {
    erc20ControlledTokenFactory,
    signers,
  };
}

export async function setupERC20ControlledTokenFactory() {
  const { erc20ControlledTokenImpl } = await deployERC20ControlledTokenImpl();

  const { signers, erc20ControlledTokenFactory } =
    await deployERC20ControlledTokenFactory();

  const { erc20TokenRegistry } = await setupERC20TokenRegistry({
    tokenFactory: erc20ControlledTokenFactory,
  });

  await erc20ControlledTokenFactory.initialize(
    ZeroAddress,
    erc20TokenRegistry,
    erc20ControlledTokenImpl,
  );

  const computeTokenAddress = await createProxyAddressFactory(
    erc20TokenRegistry,
    erc20ControlledTokenImpl,
    (salt) => id(salt),
  );

  const tokenTypeEncoder = await createTypedDataEncoder<{
    name: string;
    symbol: string;
    owner: AddressLike;
    minter: AddressLike;
    burner: AddressLike;
    initialSupply: BigNumberish;
  }>(
    erc20ControlledTokenFactory,
    RC20_CONTROLLED_TOKEN_FACTORY_TYPED_DATA_DOMAIN,
    {
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
    },
  );

  return {
    erc20TokenRegistry,
    erc20ControlledTokenFactory,
    computeTokenAddress,
    tokenTypeEncoder,
    signers,
  };
}
