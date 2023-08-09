import { ethers } from 'hardhat';
import { AddressLike } from 'ethers';

const { deployContract, ZeroAddress } = ethers;

export async function deployGuardedMock() {
  const guardedMock = await deployContract('GuardedMock');

  return {
    guardedMock,
  };
}

export async function deployOwnableMock(
  options: {
    owner?: AddressLike;
  } = {},
) {
  const { owner } = {
    owner: ZeroAddress,
    ...options,
  };

  const ownableMock = await deployContract('OwnableMock', [owner]);

  return {
    ownableMock,
  };
}
