import { ethers } from 'hardhat';
import { AddressLike, resolveAddress, getBigInt, BigNumberish } from 'ethers';
import { getSigners } from '../../common';
import { TOKEN } from '../constants';
import { TOKEN_BASE_URL } from './constants';

const { deployContract, provider } = ethers;

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

  await tokenFactory.initialize(signers.gateway, [], tokenImpl, TOKEN_BASE_URL);

  await tokenFactory.addToken(tokenImpl);

  await tokenFactory.addToken(signers.token);

  const getTokenUrl = async (token: AddressLike, tokenId: BigNumberish) => {
    const { chainId } = await provider.getNetwork();

    const tokenAddress = await resolveAddress(token);

    return `${TOKEN_BASE_URL}${getBigInt(
      chainId,
    )}/${tokenAddress.toLowerCase()}/${getBigInt(tokenId)}`;
  };

  return {
    tokenFactory,
    tokenImpl,
    signers,
    getTokenUrl,
  };
}
