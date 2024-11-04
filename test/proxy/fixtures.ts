import { ethers, utils } from 'hardhat';
import { BytesLike } from 'ethers';

const { deployContract } = ethers;

const { computeProxyCloneAddress, getSigners, randomHex } = utils;

export async function deployCloneTarget() {
  const cloneTarget = await deployContract('CloneTarget');

  return {
    cloneTarget,
  };
}

export async function deployCloneImplMock() {
  const signers = await getSigners('factory');

  const cloneImpl = await deployContract('CloneImplMock', [signers.factory]);

  return {
    cloneImpl,
    signers,
  };
}

export async function deployCloneFactoryMock() {
  const { cloneTarget } = await deployCloneTarget();

  const cloneFactory = await deployContract('CloneFactoryMock', [cloneTarget]);

  return {
    cloneTarget,
    cloneFactory,
  };
}

export async function setupCloneFactoryMock() {
  const { cloneTarget, cloneFactory } = await deployCloneFactoryMock();
  const { signers, cloneImpl } = await deployCloneImplMock();

  const computeCloneAddress = (salt: BytesLike) =>
    computeProxyCloneAddress(cloneFactory, cloneTarget, salt);

  const createClone = async (salt: BytesLike, initData: BytesLike) => {
    const cloneAddress = await computeCloneAddress(salt);

    await cloneFactory.createClone(salt, cloneImpl, initData);

    return cloneImpl.attach(cloneAddress) as typeof cloneImpl;
  };

  return {
    signers,
    cloneFactory,
    cloneImpl,
    cloneTarget,
    computeCloneAddress,
    createClone,
  };
}

export async function setupCloneMock() {
  const { signers, cloneTarget, cloneImpl, createClone } =
    await setupCloneFactoryMock();

  const clone = await createClone(
    randomHex(),
    cloneImpl.interface.encodeFunctionData('initialize', [0]),
  );

  return {
    signers,
    clone,
    cloneImpl,
    cloneTarget,
  };
}
