import { ethers } from 'hardhat';
import { runScript } from '../../common';
import { TOKENS_METADATA } from './constants';
import { generateERC20Tokens } from './generateERC20Tokens';
import { generateERC721Tokens } from './generateERC721Tokens';

const { getSigners } = ethers;

runScript(async () => {
  const [owner] = await getSigners();

  console.log('# ERC20');
  console.log();

  await generateERC20Tokens({
    owner,
    tokensMetadata: TOKENS_METADATA.slice(0, 30),
    mintAmount: {
      min: 1_000_000,
      max: 1_000_000_000,
    },
    burnAmount: {
      min: 5_000,
    },
    totalTransfers: {
      max: 100,
    },
    totalApproves: {
      max: 50,
    },
  });

  console.log('# ERC721');
  console.log();

  await generateERC721Tokens({
    owner,
    tokensMetadata: TOKENS_METADATA.slice(30, 60),
    totalTransfers: {
      max: 30,
    },
    totalApproves: {
      max: 20,
    },
    totalBurn: {
      max: 20,
    },
    totalApprovesForAll: {
      max: 10,
    },
  });
});
