import { ethers } from 'hardhat';
import { getSigners } from '../common';

const { deployContract } = ethers;

export async function deployGuardedMock() {
  const signers = await getSigners('owner', 'guardian');

  const guarded = await deployContract('GuardedMock', [signers.guardian]);

  return {
    guarded,
    signers,
  };
}

export async function deployOwnableMock() {
  const signers = await getSigners('owner');

  const ownable = await deployContract('OwnableMock');

  return {
    ownable,
    signers,
  };
}
