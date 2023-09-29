import { ethers } from 'hardhat';
import { ZeroAddress, id, BigNumberish } from 'ethers';
import {
  getSigners,
  TYPED_DATA_DOMAIN,
  createTypedDataHelper,
  createProxyCloneAddressFactory,
} from '../../../common';
import { FIXED_TOKEN } from './constants';

const { deployContract, getContractAt } = ethers;

export async function deployERC20FixedTokenImpl() {
  const tokenImpl = await deployContract('ERC20FixedTokenImpl');

  return {
    tokenImpl,
  };
}

export async function deployERC20FixedTokenFactory() {
  const signers = await getSigners('owner', 'guardian');

  const tokenFactory = await deployContract('ERC20FixedTokenFactory', [
    signers.owner,
    TYPED_DATA_DOMAIN.name,
    TYPED_DATA_DOMAIN.version,
  ]);

  return {
    signers,
    tokenFactory,
  };
}

export async function setupERC20FixedTokenFactory() {
  const { tokenImpl } = await deployERC20FixedTokenImpl();
  const { tokenFactory, signers } = await deployERC20FixedTokenFactory();

  await tokenFactory.initialize(ZeroAddress, [signers.guardian], tokenImpl);

  await tokenFactory.createToken(
    {
      ...FIXED_TOKEN,
      owner: signers.owner,
    },
    '0x',
  );

  const computeToken = await createProxyCloneAddressFactory(
    tokenFactory,
    tokenImpl,
    (symbol) => id(symbol),
  );

  const token = await getContractAt(
    'ERC20FixedTokenImpl',
    computeToken(FIXED_TOKEN.symbol),
  );

  const typeDataHelper = await createTypedDataHelper<{
    Token: {
      name: string;
      symbol: string;
      owner: string;
      totalSupply: BigNumberish;
    };
  }>(tokenFactory, {
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
    tokenFactory,
    tokenImpl,
    token,
    computeToken,
    signers,
    typeDataHelper,
  };
}
