import { ethers } from 'hardhat';

const { deployContract } = ethers;

export async function deployTokenReceiverMock() {
  const tokenReceiverMock = await deployContract('TokenReceiverMock');

  return {
    tokenReceiverMock,
  };
}
