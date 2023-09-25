import { ethers } from 'hardhat';
import { ZeroAddress } from 'ethers';

const { deployContract, getSigners } = ethers;

export async function deployGuardedMock() {
  const [owner, guardian, ...unknown] = await getSigners();

  const guardedMock = await deployContract('GuardedMock', [guardian]);

  return {
    guardedMock,
    signers: {
      owner,
      guardian,
      unknown,
    },
  };
}

export async function deployOwnableMock() {
  const [owner, ...unknown] = await getSigners();

  const ownableMock = await deployContract('OwnableMock', [ZeroAddress]);

  return {
    ownableMock,
    signers: {
      owner,
      unknown,
    },
  };
}
