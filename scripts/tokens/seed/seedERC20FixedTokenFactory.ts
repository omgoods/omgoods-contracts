import { deployments, ethers } from 'hardhat';
import { AddressLike, BigNumberish } from 'ethers';
import { logTx } from '../../common';
import { generateERC20TokenEvents } from './helpers';

const { getAddress } = deployments;

const { getContractAt } = ethers;

export async function seedERC20FixedTokenFactory(
  tokenData: {
    name: string;
    symbol: string;
    owner: AddressLike;
    totalSupply: BigNumberish;
  },
  options: {
    approves: BigNumberish[];
    transfers: BigNumberish[];
  },
): Promise<void> {
  const tokenFactoryName = 'ERC20FixedTokenFactory' as const;

  console.log(`# ${tokenFactoryName}`);

  const tokenFactory = await getContractAt(
    tokenFactoryName,
    await getAddress(tokenFactoryName),
  );

  const token = await getContractAt(
    'ERC20FixedTokenImpl',
    await tokenFactory.computeToken(tokenData.symbol),
  );

  if (!(await tokenFactory.hasToken(token))) {
    await logTx('creating token', tokenFactory.createToken(tokenData, '0x'));
  }

  await generateERC20TokenEvents(token, options);

  console.log();
}
