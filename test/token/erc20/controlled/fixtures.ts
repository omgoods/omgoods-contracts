import { ethers } from 'hardhat';
import { ZeroAddress, id } from 'ethers';
import {
  getSigners,
  TYPED_DATA_DOMAIN,
  createTypedDataHelper,
  createProxyCloneAddressFactory,
} from '../../../common';
import { TOKEN } from '../../constants';

const { deployContract, getContractAt } = ethers;

export async function deployERC20ControlledTokenImpl() {
  const tokenImpl = await deployContract('ERC20ControlledTokenImpl');

  return {
    tokenImpl,
  };
}

export async function deployERC20ControlledTokenFactory() {
  const signers = await getSigners('owner', 'guardian', 'controller');

  const tokenFactory = await deployContract('ERC20ControlledTokenFactory', [
    signers.owner,
    TYPED_DATA_DOMAIN.name,
    TYPED_DATA_DOMAIN.version,
  ]);

  return {
    signers,
    tokenFactory,
  };
}

export async function setupERC20ControlledTokenFactory() {
  const { tokenImpl } = await deployERC20ControlledTokenImpl();
  const { tokenFactory, signers } = await deployERC20ControlledTokenFactory();

  await tokenFactory.initialize(ZeroAddress, [signers.guardian], tokenImpl);

  await tokenFactory.createToken(
    {
      ...TOKEN,
      controller: signers.controller,
    },
    '0x',
  );

  const computeToken = await createProxyCloneAddressFactory(
    tokenFactory,
    tokenImpl,
    (symbol) => id(symbol),
  );

  const token = await getContractAt(
    'ERC20ControlledTokenImpl',
    computeToken(TOKEN.symbol),
  );

  const typeDataHelper = await createTypedDataHelper<{
    Token: {
      name: string;
      symbol: string;
      controller: string;
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
        name: 'controller',
        type: 'address',
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
