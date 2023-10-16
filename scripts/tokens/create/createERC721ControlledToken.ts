import prompts from 'prompts';
import { ethers } from 'hardhat';
import { logTx, randomAddress } from '../../common';
import { promptTokenMetadata } from './utils';

const { getContractAt } = ethers;

export async function createERC721ControlledToken(
  address: string,
): Promise<string> {
  const { name, symbol } = await promptTokenMetadata();

  const { controller } = await prompts({
    type: 'text',
    name: 'controller',
    message: 'Controller address',
    initial: randomAddress(),
  });

  console.log();

  const tokenFactory = await getContractAt(
    'ERC721ControlledTokenFactory',
    address,
  );
  const token = await tokenFactory.computeToken(symbol);

  await logTx(
    `Creating token: ${token}`,
    tokenFactory.createToken(
      {
        name,
        symbol,
        controllers: [controller],
      },
      '0x',
    ),
  );

  return tokenFactory.computeToken(symbol);
}
