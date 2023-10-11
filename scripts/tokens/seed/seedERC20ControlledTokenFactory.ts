import { deployments, ethers } from 'hardhat';
import { AddressLike, BigNumberish } from 'ethers';
import { logTx } from '../../common';
import { generateERC20TokenEvents } from './helpers';

const { getAddress } = deployments;

const { getContractAt } = ethers;

export async function seedERC20ControlledTokenFactory(
  tokenData: {
    name: string;
    symbol: string;
    controllers: AddressLike[];
  },
  options: {
    mint: BigNumberish;
    burn: BigNumberish;
    approves: BigNumberish[];
    transfers: BigNumberish[];
  },
): Promise<void> {
  const tokenFactoryName = 'ERC20ControlledTokenFactory' as const;

  console.log(`# ${tokenFactoryName}`);

  const tokenFactory = await getContractAt(
    tokenFactoryName,
    await getAddress(tokenFactoryName),
  );

  const token = await getContractAt(
    'ERC20ControlledTokenImpl',
    await tokenFactory.computeToken(tokenData.symbol),
  );

  if (!(await tokenFactory.hasToken(token))) {
    await logTx('creating token', tokenFactory.createToken(tokenData, '0x'));
  }

  await logTx(
    'mint tokens',
    token.mint(tokenData.controllers[0], options.mint),
  );

  await logTx(
    'burn tokens',
    token.burn(tokenData.controllers[0], options.burn),
  );

  await generateERC20TokenEvents(token, options);

  console.log();
}
