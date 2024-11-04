import { ethers, utils } from 'hardhat';
import { BaseContract, BytesLike } from 'ethers';
import { deployCloneTarget } from '../proxy/fixtures';
import { TYPED_DATA_DOMAIN_NAME, createTypedDataHelper } from '../common';

const { deployContract } = ethers;

const { computeProxyCloneAddress, getSigners, randomHex } = utils;

export async function deployTokenImplMock() {
  const signers = await getSigners('owner', 'controller', 'factory');

  const tokenImpl = await deployContract('TokenImplMock', [
    TYPED_DATA_DOMAIN_NAME,
    signers.factory,
  ]);

  return {
    tokenImpl,
    signers,
  };
}

export async function deployTokenFactory() {
  const { cloneTarget } = await deployCloneTarget();

  const { signers, tokenImpl } = await deployTokenImplMock();

  const tokenFactory = await deployContract('TokenFactory', [
    TYPED_DATA_DOMAIN_NAME,
    signers.owner,
    cloneTarget,
  ]);

  return {
    signers,
    cloneTarget,
    tokenImpl,
    tokenFactory,
  };
}

export async function setupTokenHelper() {
  const tokenHelper = await deployContract('TokenHelper');

  const erc20Token = await deployContract('ERC20ExternalToken', ['', '', 0]);

  const erc721Token = await deployContract('ERC721ExternalToken', ['', '', []]);

  return {
    tokenHelper,
    erc20Token,
    erc721Token,
  };
}

export async function setupTokenFactory() {
  const { signers, cloneTarget, tokenImpl, tokenFactory } =
    await deployTokenFactory();

  const computeTokenAddress = (salt: BytesLike) =>
    computeProxyCloneAddress(tokenFactory, cloneTarget, salt);

  const createToken = async <C extends BaseContract>(
    salt: BytesLike,
    impl: C,
    initData: BytesLike,
  ) => {
    const tokenAddress = await computeTokenAddress(salt);

    await tokenFactory['createToken(bytes32,address,bytes)'](
      salt,
      impl,
      initData,
    );

    return impl.attach(tokenAddress) as C;
  };

  const token = await createToken(
    randomHex(),
    tokenImpl,
    tokenImpl.interface.encodeFunctionData('initialize', [
      signers.owner.address,
      signers.controller.address,
      false,
    ]),
  );

  const typedDataHelper = await createTypedDataHelper<{
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
    signers,
    typedDataHelper,
    computeTokenAddress,
    createToken,
    tokenFactory,
    tokenImpl,
    token,
  };
}
