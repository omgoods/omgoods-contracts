import { ethers, utils } from 'hardhat';

const { deployContract } = ethers;
const { getSigners } = utils;

export async function setupGuardedMock() {
  const signers = await getSigners('owner', 'guardian');

  const guarded = await deployContract('GuardedMock', [signers.guardian]);

  return {
    guarded,
    signers,
  };
}

export async function setupOwnableMock() {
  const signers = await getSigners('owner');

  const ownable = await deployContract('OwnableMock');

  return {
    ownable,
    signers,
  };
}
