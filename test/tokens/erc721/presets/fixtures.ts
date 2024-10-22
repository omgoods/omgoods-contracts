import { ethers } from 'hardhat';
import { ERC721_TOKEN } from '../constants';
import { setupTokenDefaultFactory } from '../../presets/fixtures';

const { deployContract, getContractAt } = ethers;

export async function deployERC721TokenDefaultImpl() {
  const tokenImpl = await deployContract('ERC721TokenDefaultImpl');

  return {
    tokenImpl,
  };
}

export async function setupERC721TokenDefaultImpl() {
  const { tokenImpl } = await deployERC721TokenDefaultImpl();

  const result = await setupTokenDefaultFactory({
    tokenImpl,
  });

  const { computeTokenAddress } = result;

  const token = await getContractAt(
    'ERC721TokenDefaultImpl',
    await computeTokenAddress(ERC721_TOKEN.symbol),
  );

  return {
    token,
    tokenImpl,
    ...result,
  };
}
