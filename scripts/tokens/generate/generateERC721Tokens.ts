import { deployments, ethers } from 'hardhat';
import { AddressLike } from 'ethers';
import { logTx, randomAddress, randomBool, randomInt } from '../../common';

const { getAddress } = deployments;

const { getContractAt } = ethers;

const TOKEN_ID_BASE = BigInt(Date.now()) * 1_000_000n;

export async function generateERC721Tokens(options: {
  owner: AddressLike;
  tokensMetadata: {
    name: string;
    symbol: string;
  }[];
  totalBurn: {
    max: number;
  };
  totalTransfers: {
    max: number;
  };
  totalApproves: {
    max: number;
  };
  totalApprovesForAll: {
    max: number;
  };
}): Promise<void> {
  const tokenRegistry = await getContractAt(
    'TokenRegistry',
    await getAddress('TokenRegistry'),
  );

  const tokenFactory = await getContractAt(
    'DefaultTokenFactory',
    await getAddress('ERC721DefaultTokenFactory'),
  );

  for (const { name, symbol } of options.tokensMetadata) {
    const tokenAddress = await tokenFactory.computeToken(symbol);

    const token = await getContractAt('ERC721DefaultTokenImpl', tokenAddress);

    console.log(`## ${name} Token (${tokenAddress})`);
    console.log();

    if (!(await tokenRegistry.hasToken(token))) {
      await logTx(
        'creating',
        tokenFactory.createToken(
          options.owner,
          name,
          symbol,
          options.owner, // controller
          false,
          '0x',
        ),
      );

      console.log();
    }

    const totalBurn = randomInt(0, options.totalBurn.max);
    const totalTransfers = randomInt(0, options.totalTransfers.max);
    const totalApproves = randomInt(0, options.totalApproves.max);
    const totalApprovesForAll = randomInt(0, options.totalApprovesForAll.max);

    const totalTokenIds = totalBurn + totalTransfers + totalApproves;

    const tokenIds: bigint[] = [];

    for (let index = 0; index < totalTokenIds; index++) {
      const tokenId = TOKEN_ID_BASE + BigInt(index + 1);

      await logTx(`minting #${index}`, token.mint(options.owner, tokenId));

      tokenIds.push(tokenId);
    }

    console.log();

    for (let index = 0; index < totalBurn; index++) {
      const tokenId = tokenIds.pop();

      await logTx(`burning #${index}`, token.burn(tokenId));
    }

    console.log();

    for (let index = 0; index < totalTransfers; index++) {
      const tokenId = tokenIds.pop();

      await logTx(
        `transferring #${index}`,
        token.transferFrom(options.owner, randomAddress(), tokenId),
      );
    }

    console.log();

    for (let index = 0; index < totalApproves; index++) {
      const tokenId = tokenIds.pop();

      await logTx(
        `approving #${index}`,
        token.approve(randomAddress(), tokenId),
      );
    }

    console.log();

    for (let index = 0; index < totalApprovesForAll; index++) {
      await logTx(
        `approving for all #${index}`,
        token.setApprovalForAll(randomAddress(), randomBool()),
      );
    }

    console.log();
  }
}
