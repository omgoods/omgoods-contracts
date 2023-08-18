import { ethers, testing } from 'hardhat';
import { AddressLike } from 'ethers';

const { deployContract, ZeroAddress } = ethers;

const { buildSigners } = testing;

export async function deployGuardedMock() {
  const signers = await buildSigners('owner', 'guardian');

  const guardedMock = await deployContract('GuardedMock', [signers.guardian]);

  return {
    guardedMock,
    signers,
  };
}

export async function deployOwnableMock(
  options: {
    owner?: AddressLike;
  } = {},
) {
  const signers = await buildSigners('owner');

  const { owner } = {
    owner: ZeroAddress,
    ...options,
  };

  const ownableMock = await deployContract('OwnableMock', [owner]);

  return {
    ownableMock,
    signers,
  };
}
