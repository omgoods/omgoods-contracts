import { ethers } from 'hardhat';
import { ERC721_TOKEN } from './constants';
import { setupTokenRegistry } from '../fixtures';

const { deployContract } = ethers;

export async function deployERC721ExternalToken() {
  const externalToken = await deployContract('ERC721ExternalToken', [
    ERC721_TOKEN.name,
    ERC721_TOKEN.symbol,
    ERC721_TOKEN.tokenIds,
  ]);

  return {
    externalToken,
  };
}

export async function deployERC721TokenMock() {
  const token = await deployContract('ERC721TokenMock');

  return {
    token,
  };
}

export async function setupERC721TokenMock() {
  const { token } = await deployERC721TokenMock();

  const { signers, tokenRegistry } = await setupTokenRegistry({
    token,
  });

  await token.initialize(tokenRegistry, true, ERC721_TOKEN.tokenIds);

  return {
    signers,
    token,
    tokenRegistry,
  };
}
