import { ethers } from 'hardhat';
import { AddressLike } from 'ethers';
import { getSigners } from '../../common';
import { TOKEN } from '../constants';

const { deployContract } = ethers;

export async function deployERC20TokenImplMock(options: {
  gateway: AddressLike;
  tokenFactory: AddressLike;
}) {
  const tokenImpl = await deployContract('ERC20TokenImplMock', [
    options.gateway,
    options.tokenFactory,
    TOKEN.name,
    TOKEN.symbol,
  ]);

  return {
    tokenImpl,
  };
}

export async function deployERC20TokenFactoryMock() {
  const signers = await getSigners('owner', 'gateway', 'token');

  const tokenFactory = await deployContract('ERC20TokenFactoryMock');

  return {
    signers,
    tokenFactory,
  };
}

export async function setupERC20TokenFactoryMock() {
  const { tokenFactory, signers } = await deployERC20TokenFactoryMock();

  const { tokenImpl } = await deployERC20TokenImplMock({
    tokenFactory,
    gateway: signers.gateway,
  });

  await tokenFactory.addToken(tokenImpl);

  await tokenFactory.addToken(signers.token);

  return {
    tokenFactory,
    tokenImpl,
    signers,
  };
}