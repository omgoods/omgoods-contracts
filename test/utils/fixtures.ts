import { ethers } from 'hardhat';

const { deployContract } = ethers;

export async function setupBytesMock() {
  const bytes = await deployContract('BytesMock');

  return {
    bytes,
  };
}

export async function setupInitializableMock() {
  const initializable = await deployContract('InitializableMock');

  return {
    initializable,
  };
}
