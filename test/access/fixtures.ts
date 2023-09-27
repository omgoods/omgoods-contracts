import { ethers } from 'hardhat';
import { ZeroAddress, AddressLike } from 'ethers';
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

export async function deployOwnableMock(options?: { owner: AddressLike }) {
  const signers = await getSigners('owner');

  const ownable = await deployContract('OwnableMock', [
    options?.owner || ZeroAddress,
  ]);

  return {
    ownable,
    signers,
  };
}
