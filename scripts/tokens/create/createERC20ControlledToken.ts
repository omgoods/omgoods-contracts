import prompts from 'prompts';
import { ethers } from 'hardhat';
import { logTx, randomAddress } from '../../common';
import { promptMetadata } from './helpers';

const { getContractAt } = ethers;

export async function createERC20ControlledToken(
  address: string,
): Promise<string> {
  const { name, symbol } = await promptMetadata();

  const { controller } = await prompts({
    type: 'text',
    name: 'controller',
    message: 'Controller address',
    initial: randomAddress(),
  });

  console.log();

  const tokenFactory = await getContractAt(
    'ERC20ControlledTokenFactory',
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
