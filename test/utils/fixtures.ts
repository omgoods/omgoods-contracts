import { ethers } from 'hardhat';

const { deployContract } = ethers;

export async function deployBytesMock() {
  const bytes = await deployContract('BytesMock');

  return {
    bytes,
  };
}

export async function deployInitializableMock() {
  const initializable = await deployContract('InitializableMock');

  return {
    initializable,
  };
}
