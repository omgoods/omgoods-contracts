import { ethers, utils } from 'hardhat';
import { BigNumberish } from 'ethers';
import { createTypedDataHelper, TYPED_DATA_DOMAIN_NAME } from '../../../common';
import { TOKEN_METADATA } from '../../constants';
import { setupTokenFactory } from '../../fixtures';
import { TOKEN_TOTAL_SUPPLY } from './constants';

const { deployContract, ZeroAddress, MaxUint256 } = ethers;
const { getSigners, randomHex } = utils;

export async function setupTokenImplMock() {
  const signers = await getSigners('owner', 'controller');

  const tokenImpl = await deployContract('ERC20TokenImplMock', [
    TYPED_DATA_DOMAIN_NAME,
  ]);

  const { createToken, tokenFactory } = await setupTokenFactory({
    tokenImpl,
  });

  const token = await createToken(
    randomHex(),
    tokenImpl.interface.encodeFunctionData('initialize', [
      signers.owner.address,
      signers.controller.address,
      TOKEN_METADATA.name,
      TOKEN_METADATA.symbol,
      TOKEN_METADATA.decimals,
    ]),
  );

  await token.connect(signers.owner).mint(signers.owner, TOKEN_TOTAL_SUPPLY);

  await token
    .connect(signers.owner)
    .approve(signers.controller, TOKEN_TOTAL_SUPPLY);

  return {
    signers,
    token,
    tokenImpl,
    tokenFactory,
  };
}

export async function setupTokenRegularImpl() {
  const signers = await getSigners('owner', 'controller');

  const tokenImpl = await deployContract('ERC20TokenRegularImpl', [
    TYPED_DATA_DOMAIN_NAME,
  ]);

  const { createToken, tokenFactory } = await setupTokenFactory({
    tokenImpl,
  });

  const token = await createToken(
    randomHex(),
    tokenImpl.interface.encodeFunctionData('initialize', [
      ZeroAddress,
      signers.owner.address,
      signers.controller.address,
      TOKEN_METADATA.name,
      TOKEN_METADATA.symbol,
      TOKEN_METADATA.decimals,
      false,
    ]),
  );

  await token.connect(signers.owner).mint(signers.owner, TOKEN_TOTAL_SUPPLY);

  const tokenImplTypedData = await createTypedDataHelper<{
    Initialization: {
      owner: string;
      controller: string;
      name: string;
      symbol: string;
      decimals: BigNumberish;
      ready: boolean;
    };
  }>(tokenImpl, {
    Initialization: [
      {
        name: 'owner',
        type: 'address',
      },
      {
        name: 'controller',
        type: 'address',
      },
      {
        name: 'name',
        type: 'string',
      },
      {
        name: 'symbol',
        type: 'string',
      },
      {
        name: 'decimals',
        type: 'uint8',
      },
      {
        name: 'ready',
        type: 'bool',
      },
    ],
  });

  return {
    signers,
    token,
    tokenFactory,
    tokenImpl,
    tokenImplTypedData,
  };
}

export async function setupTokenWrappedImpl() {
  const signers = await getSigners('owner');

  const underlyingToken = await deployContract('ERC20ExternalToken', [
    TOKEN_METADATA.name,
    TOKEN_METADATA.symbol,
    TOKEN_METADATA.decimals,
    TOKEN_TOTAL_SUPPLY,
  ]);

  const underlyingTokenAddress = await underlyingToken.getAddress();

  const tokenImpl = await deployContract('ERC20TokenWrappedImpl', [
    TYPED_DATA_DOMAIN_NAME,
  ]);

  const { createToken, tokenFactory } = await setupTokenFactory({
    tokenImpl,
  });

  const token = await createToken(
    randomHex(),
    tokenImpl.interface.encodeFunctionData('initialize', [
      ZeroAddress,
      underlyingTokenAddress,
    ]),
  );

  await underlyingToken.approve(token, MaxUint256);
  await token.wrap(TOKEN_TOTAL_SUPPLY / 2);

  const tokenImplTypedData = await createTypedDataHelper<{
    Initialization: {
      underlyingToken: string;
    };
  }>(tokenImpl, {
    Initialization: [
      {
        name: 'underlyingToken',
        type: 'address',
      },
    ],
  });

  return {
    signers,
    underlyingToken,
    token,
    tokenFactory,
    tokenImpl,
    tokenImplTypedData,
  };
}
