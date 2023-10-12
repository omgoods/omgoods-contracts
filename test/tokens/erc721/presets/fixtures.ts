import { ethers } from 'hardhat';
import { ZeroAddress, id } from 'ethers';
import {
  getSigners,
  TYPED_DATA_DOMAIN_NAME,
  createTypedDataHelper,
  createProxyCloneAddressFactory,
} from '../../../common';
import { TOKEN } from '../../constants';
import { TOKEN_BASE_URL } from '../constants';

const { deployContract, getContractAt } = ethers;

export async function deployERC721ControlledTokenImpl() {
  const tokenImpl = await deployContract('ERC721ControlledTokenImpl');

  return {
    tokenImpl,
  };
}

export async function deployERC721ControlledTokenFactory() {
  const signers = await getSigners('owner', 'guardian', 'controller');

  const tokenFactory = await deployContract('ERC721ControlledTokenFactory', [
    signers.owner,
    TYPED_DATA_DOMAIN_NAME,
  ]);

  return {
    signers,
    tokenFactory,
  };
}

export async function setupERC721ControlledTokenFactory() {
  const { tokenImpl } = await deployERC721ControlledTokenImpl();
  const { tokenFactory, signers } = await deployERC721ControlledTokenFactory();

  await tokenFactory.initialize(
    ZeroAddress,
    [signers.guardian],
    tokenImpl,
    TOKEN_BASE_URL,
  );

  await tokenFactory.createToken(
    {
      ...TOKEN,
      controllers: [signers.controller],
    },
    '0x',
  );

  const computeToken = await createProxyCloneAddressFactory(
    tokenFactory,
    tokenImpl,
    (symbol) => id(symbol),
  );

  const token = await getContractAt(
    'ERC721ControlledTokenImpl',
    computeToken(TOKEN.symbol),
  );

  const typeDataHelper = await createTypedDataHelper<{
    Token: {
      name: string;
      symbol: string;
      controllers: string[];
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
        name: 'controllers',
        type: 'address[]',
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
