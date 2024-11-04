import { ethers, utils } from 'hardhat';
import { BytesLike } from 'ethers';

const { deployContract } = ethers;
const { computeProxyCloneAddress, getSigners, randomHex } = utils;

export async function setupCloneFactoryMock() {
  const signers = await getSigners('factory');

  const cloneImpl = await deployContract('CloneImplMock', [signers.factory]);
  const cloneTarget = await deployContract('CloneTarget');
  const cloneFactory = await deployContract('CloneFactoryMock', [cloneTarget]);

  const computeCloneAddress = (salt: BytesLike) =>
    computeProxyCloneAddress(cloneFactory, cloneTarget, salt);

  const createClone = async (salt: BytesLike, initData: BytesLike) => {
    const cloneAddress = await computeCloneAddress(salt);

    await cloneFactory.createClone(salt, cloneImpl, initData);

    return cloneImpl.attach(cloneAddress) as typeof cloneImpl;
  };

  const clone = await createClone(
    randomHex(),
    cloneImpl.interface.encodeFunctionData('initialize', [0]),
  );

  return {
    signers,
    clone,
    cloneFactory,
    cloneImpl,
    cloneTarget,
    computeCloneAddress,
    createClone,
  };
}
