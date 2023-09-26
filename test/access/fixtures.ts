import { ethers } from 'hardhat';
import { ZeroAddress, AddressLike } from 'ethers';
import { getSigners } from '../helpers';

const { deployContract } = ethers;

export async function deployGuardedMock() {
  const signers = await getSigners('owner', 'guardian');

  const guardedMock = await deployContract('GuardedMock', [signers.guardian]);

  return {
    guardedMock,
    signers,
  };
}

export async function deployOwnableMock(options?: { owner: AddressLike }) {
  const signers = await getSigners('owner');

  const ownableMock = await deployContract('OwnableMock', [
    options?.owner || ZeroAddress,
  ]);

  return {
    ownableMock,
    signers,
  };
}
