import { ethers } from 'hardhat';
import { ERC20_TOKEN } from './constants';
import { setupTokenRegistry } from '../fixtures';

const { deployContract } = ethers;

export async function deployERC20ExternalToken() {
  const externalToken = await deployContract('ERC20ExternalToken', [
    ERC20_TOKEN.name,
    ERC20_TOKEN.symbol,
    ERC20_TOKEN.totalSupply,
  ]);

  return {
    externalToken,
  };
}

export async function deployERC20TokenMock() {
  const token = await deployContract('ERC20TokenMock');

  return {
    token,
  };
}

export async function setupERC20TokenMock() {
  const { token } = await deployERC20TokenMock();

  const { signers, tokenRegistry } = await setupTokenRegistry({
    token,
  });

  await token.initialize(tokenRegistry, ERC20_TOKEN.totalSupply);

  return {
    signers,
    token,
    tokenRegistry,
  };
}
