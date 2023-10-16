import { ethers } from 'hardhat';
import { runScript } from '../../common';
import { generateERC20Events } from './generateERC20Events';
import { generateERC721Events } from './generateERC721Events';

const { getSigners } = ethers;

runScript(async () => {
  const [signer] = await getSigners();

  await generateERC20Events(signer);

  console.log();

  await generateERC721Events(signer);
});
