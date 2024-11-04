import { ethers, utils } from 'hardhat';
import { BaseContract, BytesLike } from 'ethers';
import { TYPED_DATA_DOMAIN_NAME, createTypedDataHelper } from '../common';
import { TOKEN_METADATA } from './constants';

const { deployContract } = ethers;
const { computeProxyCloneAddress, getSigners, randomHex } = utils;

function deployTokenImplMock() {
  return deployContract('TokenImplMock', [TYPED_DATA_DOMAIN_NAME]);
}

export async function setupTokenHelper() {
  const tokenHelper = await deployContract('TokenHelper');

  const erc20Token = await deployContract('ERC20ExternalToken', [
    TOKEN_METADATA.name,
    TOKEN_METADATA.symbol,
    TOKEN_METADATA.decimals,
    1_000_000,
  ]);

  const erc721Token = await deployContract('ERC721ExternalToken', [
    TOKEN_METADATA.name,
    TOKEN_METADATA.symbol,
    [],
  ]);

  return {
    tokenHelper,
    erc20Token,
    erc721Token,
  };
}

export async function setupTokenFactory<
  T extends BaseContract = Awaited<ReturnType<typeof deployTokenImplMock>>,
>(
  options: {
    tokenImpl?: T;
  } = {},
) {
  let { tokenImpl } = options;

  const signers = await getSigners('owner', 'controller');

  const cloneTarget = await deployContract('CloneTarget');

  if (!tokenImpl) {
    tokenImpl = (await deployTokenImplMock()) as BaseContract as T;
  }

  const tokenFactory = await deployContract('TokenFactory', [
    TYPED_DATA_DOMAIN_NAME,
    signers.owner,
    cloneTarget,
  ]);

  const computeTokenAddress = (salt: BytesLike) =>
    computeProxyCloneAddress(tokenFactory, cloneTarget, salt);

  const createToken = async (salt: BytesLike, initData: BytesLike) => {
    const tokenAddress = await computeTokenAddress(salt);

    await tokenFactory['createToken(bytes32,address,bytes)'](
      salt,
      tokenImpl,
      initData,
    );

    return tokenImpl.attach(tokenAddress) as T;
  };

  const tokenFactoryTypedData = await createTypedDataHelper<{
    Token: {
      salt: string;
      impl: string;
      initData: string;
    };
  }>(tokenFactory, {
    Token: [
      {
        name: 'salt',
        type: 'bytes32',
      },
      {
        name: 'impl',
        type: 'address',
      },
      {
        name: 'initData',
        type: 'bytes',
      },
    ],
  });

  return {
    computeTokenAddress,
    createToken,
    signers,
    tokenFactory,
    tokenFactoryTypedData,
    tokenImpl,
  };
}

export async function setupTokenMock() {
  const result = await setupTokenFactory();

  const { signers, tokenImpl, createToken } = result;

  const token = await createToken(
    randomHex(),
    tokenImpl.interface.encodeFunctionData('initialize', [
      signers.owner.address,
      signers.controller.address,
      false,
    ]),
  );

  const tokenImpTypedData = await createTypedDataHelper<{
    Initialization: {
      owner: string;
      controller: string;
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
        name: 'ready',
        type: 'bool',
      },
    ],
  });

  return {
    ...result,
    token,
    tokenImpTypedData,
  };
}
