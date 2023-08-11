import { ethers, helpers } from 'hardhat';

const { deployContract } = ethers;

const { setBalance, buildSigners } = helpers;

export async function deployERC1271AccountMock() {
  const signers = await buildSigners('owner');

  const erc1271AccountMock = await deployContract('ERC1271AccountMock');

  return {
    erc1271AccountMock,
    signers,
  };
}

export async function deployERC4337AccountMock() {
  const signers = await buildSigners('owner', 'entryPoint');

  const erc4337AccountMock = await deployContract('ERC4337AccountMock', [
    signers.entryPoint,
  ]);

  await setBalance(erc4337AccountMock);

  return {
    erc4337AccountMock,
    signers,
  };
}
