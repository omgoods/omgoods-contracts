import { ethers } from 'hardhat';
import {
  ZeroAddress,
  keccak256,
  parseEther,
  MaxUint256,
  id,
  BigNumberish,
} from 'ethers';
import {
  getSigners,
  TYPED_DATA_DOMAIN_NAME,
  createTypedDataHelper,
  createProxyCloneAddressFactory,
} from '../../../common';
import { deployERC20TokenMock } from '../fixtures';
import { TOKEN } from '../../constants';
import { FIXED_TOKEN } from './constants';

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
    TYPED_DATA_DOMAIN_NAME,
  ]);

  return {
    signers,
    tokenFactory,
  };
}

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
    TYPED_DATA_DOMAIN_NAME,
  ]);

  return {
    signers,
    tokenFactory,
  };
}

export async function deployERC20WrappedTokenImpl() {
  const tokenImpl = await deployContract('ERC20WrappedTokenImpl');

  return {
    tokenImpl,
  };
}

export async function deployERC20WrappedTokenFactory() {
  const signers = await getSigners('owner', 'guardian');

  const tokenFactory = await deployContract('ERC20WrappedTokenFactory', [
    signers.owner,
    TYPED_DATA_DOMAIN_NAME,
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
    'ERC20ControlledTokenImpl',
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

export async function setupERC20WrappedTokenFactory() {
  const { tokenImpl } = await deployERC20WrappedTokenImpl();
  const { tokenFactory, signers } = await deployERC20WrappedTokenFactory();

  const underlyingToken = await deployERC20TokenMock();

  const supportedToken = await deployERC20TokenMock();

  const unsupportedToken = await deployERC20TokenMock({
    decimals: 10,
  });

  await tokenFactory.initialize(ZeroAddress, [signers.guardian], tokenImpl);

  await tokenFactory.createToken(underlyingToken, '0x');

  const computeToken = await createProxyCloneAddressFactory(
    tokenFactory,
    tokenImpl,
    (underlyingToken) => keccak256(underlyingToken),
  );

  const token = await getContractAt(
    'ERC20WrappedTokenImpl',
    computeToken(await underlyingToken.getAddress()),
  );

  await underlyingToken.approve(token, MaxUint256);

  await token.deposit(parseEther('50000000'));

  const typeDataHelper = await createTypedDataHelper<{
    Token: {
      underlyingToken: string;
    };
  }>(tokenFactory, {
    Token: [
      {
        name: 'underlyingToken',
        type: 'address',
      },
    ],
  });

  return {
    tokenFactory,
    tokenImpl,
    token,
    underlyingToken,
    supportedToken,
    unsupportedToken,
    computeToken,
    signers,
    typeDataHelper,
  };
}
