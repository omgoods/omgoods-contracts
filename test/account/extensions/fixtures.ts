import { ethers, helpers } from 'hardhat';

const { deployContract, getSigners } = ethers;

const { setBalance } = helpers;

export async function deployERC1271AccountMock() {
  const erc1271AccountMock = await deployContract('ERC1271AccountMock');

  return {
    erc1271AccountMock,
  };
}

export async function deployERC4337AccountMock() {
  const [, entryPoint] = await getSigners();

  const erc4337AccountMock = await deployContract('ERC4337AccountMock', [
    entryPoint,
  ]);

  await setBalance(erc4337AccountMock);

  return {
    erc4337AccountMock,
  };
}
