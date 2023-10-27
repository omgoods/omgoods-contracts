import { ethers } from 'hardhat';
import { ERC20_EXAMPLE_TOKEN } from './constants';

const { deployContract } = ethers;

export async function deployERC20TokenExample() {
  const token = await deployContract('ERC20TokenExample', [
    ERC20_EXAMPLE_TOKEN.name,
    ERC20_EXAMPLE_TOKEN.symbol,
    ERC20_EXAMPLE_TOKEN.totalSupply,
  ]);

  return {
    token,
  };
}
