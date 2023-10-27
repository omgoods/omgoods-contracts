import { ethers } from 'hardhat';
import { ERC721_EXAMPLE_TOKEN } from './constants';

const { deployContract } = ethers;

export async function deployERC721TokenExample() {
  const token = await deployContract('ERC721TokenExample', [
    ERC721_EXAMPLE_TOKEN.name,
    ERC721_EXAMPLE_TOKEN.symbol,
    ERC721_EXAMPLE_TOKEN.tokenIds,
  ]);

  return {
    token,
  };
}
