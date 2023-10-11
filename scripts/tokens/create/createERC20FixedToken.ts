import prompts from 'prompts';
import { ethers } from 'hardhat';
import { parseEther } from 'ethers';
import { logTx, randomAddress } from '../../common';
import { promptMetadata } from './helpers';

const { getContractAt } = ethers;

export async function createERC20FixedToken(address: string): Promise<void> {
  const { name, symbol } = await promptMetadata();

  const { owner } = await prompts({
    type: 'text',
    name: 'owner',
    message: 'Owner address',
    initial: randomAddress(),
  });

  const { totalSupply } = await prompts({
    type: 'number',
    name: 'totalSupply',
    message: 'Total supply',
    initial: 100_000_000,
  });

  console.log();

  const tokenFactory = await getContractAt('ERC20FixedTokenFactory', address);
  const token = await tokenFactory.computeToken(symbol);

  await logTx(
    `Creating token: ${token}`,
    tokenFactory.createToken(
      {
        name,
        symbol,
        owner,
        totalSupply: parseEther(`${totalSupply}`),
      },
      '0x',
    ),
  );
}
