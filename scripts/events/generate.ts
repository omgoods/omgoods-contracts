import { deployments, ethers } from 'hardhat';
import {
  AddressLike,
  BigNumberish,
  ContractTransactionResponse,
  parseEther,
  MaxUint256,
} from 'ethers';
import { runScript, logTx, randomAddress } from '../common';

const { getAddress } = deployments;

const { getContractAt, getSigners } = ethers;

async function generateERC20TokenEvents<
  C extends {
    approve(
      spender: AddressLike,
      value: BigNumberish,
    ): Promise<ContractTransactionResponse>;
    transfer(
      to: AddressLike,
      value: BigNumberish,
    ): Promise<ContractTransactionResponse>;
  },
>(
  token: C,
  options: {
    approves: BigNumberish[];
    transfers: BigNumberish[];
  },
): Promise<void> {
  for (const [index, value] of Object.entries(options.approves)) {
    await logTx(
      `(${index}) approving tokens`,
      token.approve(randomAddress(), value),
    );
  }

  for (const [index, value] of Object.entries(options.transfers)) {
    await logTx(
      `(${index}) transferring tokens`,
      token.transfer(randomAddress(), value),
    );
  }
}

async function generateERC20ControlledTokenFactoryEvents(
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

async function generateERC20FixedTokenFactoryEvents(
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

runScript(async () => {
  const [signer] = await getSigners();

  await generateERC20ControlledTokenFactoryEvents(
    {
      name: 'Controlled',
      symbol: 'CONTROLLED',
      controllers: [signer],
    },
    {
      mint: parseEther('200000000'),
      burn: parseEther('10000000'),
      approves: [12, parseEther('10'), MaxUint256, 0],
      transfers: [5, parseEther('100'), 10000],
    },
  );

  await generateERC20FixedTokenFactoryEvents(
    {
      name: 'Fixed',
      symbol: 'FIXED',
      owner: signer,
      totalSupply: parseEther('100000000'),
    },
    {
      approves: [100, parseEther('100'), MaxUint256, 0],
      transfers: [10, parseEther('1.2'), 50000],
    },
  );
});
