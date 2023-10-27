import { ethers } from 'hardhat';
import { ERC721_TOKEN } from '../constants';
import { setupDefaultTokenFactory } from '../../presets/fixtures';

const { deployContract, getContractAt } = ethers;

export async function deployERC721DefaultTokenImpl() {
  const tokenImpl = await deployContract('ERC721DefaultTokenImpl');

  return {
    tokenImpl,
  };
}

export async function setupERC721DefaultTokenImpl() {
  const { tokenImpl } = await deployERC721DefaultTokenImpl();

  const result = await setupDefaultTokenFactory({
    tokenImpl,
  });

  const { computeTokenAddress } = result;

  const token = await getContractAt(
    'ERC721DefaultTokenImpl',
    await computeTokenAddress(ERC721_TOKEN.symbol),
  );

  return {
    token,
    tokenImpl,
    ...result,
  };
}
