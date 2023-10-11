import { deployments, ethers } from 'hardhat';
import { AddressLike } from 'ethers';
import { logTx, randomAddress } from '../../common';

const { getAddress } = deployments;

const { getContractAt } = ethers;

export async function seedERC721ControlledTokenFactory(
  tokenData: {
    name: string;
    symbol: string;
    controllers: AddressLike[];
  },
  options: {
    mint: number[];
    burn: number[];
  },
): Promise<void> {
  const tokenFactoryName = 'ERC721ControlledTokenFactory' as const;

  console.log(`# ${tokenFactoryName}`);

  const tokenFactory = await getContractAt(
    tokenFactoryName,
    await getAddress(tokenFactoryName),
  );

  const token = await getContractAt(
    'ERC721ControlledTokenImpl',
    await tokenFactory.computeToken(tokenData.symbol),
  );

  if (!(await tokenFactory.hasToken(token))) {
    await logTx('creating token', tokenFactory.createToken(tokenData, '0x'));
  }

  for (const tokenId of options.mint) {
    await logTx(`mint token #${tokenId}`, token.mint(randomAddress(), tokenId));
  }

  for (const tokenId of options.burn) {
    await logTx(
      `mint token #${tokenId}`,
      token.mint(tokenData.controllers[0], tokenId),
    );
  }

  for (const tokenId of options.burn) {
    await logTx(`burn token #${tokenId}`, token.burn(tokenId));
  }

  console.log();
}
