import { ethers } from 'hardhat';
import { AddressLike } from 'ethers';
import { getSigners } from '../../common';
import { TOKEN } from '../constants';

const { deployContract } = ethers;

export async function deployERC721TokenImplMock(options: {
  gateway: AddressLike;
  tokenFactory: AddressLike;
}) {
  const tokenImpl = await deployContract('ERC721TokenImplMock', [
    options.gateway,
    options.tokenFactory,
    TOKEN.name,
    TOKEN.symbol,
  ]);

  return {
    tokenImpl,
  };
}

export async function deployERC721TokenFactoryMock() {
  const signers = await getSigners('owner', 'gateway', 'token');

  const tokenFactory = await deployContract('ERC721TokenFactoryMock');

  return {
    signers,
    tokenFactory,
  };
}

export async function setupERC721TokenFactoryMock() {
  const { tokenFactory, signers } = await deployERC721TokenFactoryMock();

  const { tokenImpl } = await deployERC721TokenImplMock({
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
