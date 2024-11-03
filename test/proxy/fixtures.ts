import { ethers, utils } from 'hardhat';
import { BytesLike } from 'ethers';

const { deployContract } = ethers;

const { computeProxyCloneAddress } = utils;

export async function deployCloneTarget() {
  const cloneTarget = await deployContract('CloneTarget');

  return {
    cloneTarget,
  };
}

export async function deployCloneImplMock() {
  const cloneImpl = await deployContract('CloneImplMock');

  return {
    cloneImpl,
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
  const { cloneImpl } = await deployCloneImplMock();

  const computeCloneAddress = (salt: BytesLike) =>
    computeProxyCloneAddress(cloneFactory, cloneTarget, salt);

  return {
    cloneTarget,
    cloneFactory,
    cloneImpl,
    computeCloneAddress,
  };
}
