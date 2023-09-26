import { ethers } from 'hardhat';

const { deployContract } = ethers;

export async function deployBytesMock() {
  const bytesMock = await deployContract('BytesMock');

  return {
    bytesMock,
  };
}

export async function deployInitializableMock() {
  const initializableMock = await deployContract('InitializableMock');

  return {
    initializableMock,
  };
}
