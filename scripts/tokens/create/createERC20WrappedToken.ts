import prompts from 'prompts';
import { ethers } from 'hardhat';
import { logTx } from '../../common';

const { getContractAt } = ethers;

export async function createERC20WrappedToken(address: string): Promise<void> {
  const { underlyingToken } = await prompts({
    type: 'text',
    name: 'underlyingToken',
    message: 'Underlying token',
  });

  console.log();

  const tokenFactory = await getContractAt('ERC20WrappedTokenFactory', address);
  const token = await tokenFactory.computeToken(underlyingToken);

  await logTx(
    `Creating token: ${token}`,
    tokenFactory.createToken(underlyingToken, '0x'),
  );
}
