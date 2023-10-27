import { deployments, ethers } from 'hardhat';
import { AddressLike, MaxUint256, parseEther } from 'ethers';
import { logTx, randomAddress } from '../../common';

const { getAddress } = deployments;

const { getContractAt } = ethers;

const TOKEN_SYMBOL = 'BASIC';

const MINT_AMOUNT = parseEther('2000000000');
const BURN_AMOUNT = parseEther('500000000');
const APPROVE_AMOUNTS = [12, parseEther('10'), MaxUint256, 0];
const TRANSFER_AMOUNTS = [5, parseEther('100'), 10000];

export async function generateERC20Events(owner: AddressLike): Promise<void> {
  const tokenRegistry = await getContractAt(
    'TokenRegistry',
    await getAddress('TokenRegistry'),
  );

  const tokenFactory = await getContractAt(
    'DefaultTokenFactory',
    await getAddress('ERC20DefaultTokenFactory'),
  );

  const tokenAddress = await tokenFactory.computeToken(TOKEN_SYMBOL);

  const token = await getContractAt('ERC20DefaultTokenImpl', tokenAddress);

  console.log(`# ERC20DefaultToken (${tokenAddress})`);
  console.log();

  if (!(await tokenRegistry.hasToken(token))) {
    await logTx(
      'creating token contract',
      tokenFactory.createToken(
        owner,
        'Default',
        TOKEN_SYMBOL,
        owner, // controller
        false,
        '0x',
      ),
    );
  }

  await logTx('minting tokens', token.mint(owner, MINT_AMOUNT));

  await logTx('burning tokens', token.burn(owner, BURN_AMOUNT));

  for (const [index, value] of Object.entries(APPROVE_AMOUNTS)) {
    await logTx(
      `(${index}) approving tokens`,
      token.approve(randomAddress(), value),
    );
  }

  for (const [index, value] of Object.entries(TRANSFER_AMOUNTS)) {
    await logTx(
      `(${index}) transferring tokens`,
      token.transfer(randomAddress(), value),
    );
  }
}
