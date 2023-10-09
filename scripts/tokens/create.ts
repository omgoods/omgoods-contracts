import prompts from 'prompts';
import { deployments, ethers } from 'hardhat';
import { parseEther } from 'ethers';
import { runScript, logTx, randomAddress } from '../common';

const { all } = deployments;

const { getContractAt } = ethers;

async function promptCommonMetadata(): Promise<{
  name: string;
  symbol: string;
}> {
  const { name } = await prompts({
    type: 'text',
    name: 'name',
    message: 'Name',
  });

  const { symbol } = await prompts({
    type: 'text',
    name: 'symbol',
    message: 'Symbol',
  });

  return {
    name,
    symbol,
  };
}

async function createERC20ControlledToken(address: string): Promise<string> {
  const { name, symbol } = await promptCommonMetadata();

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
        controller,
      },
      '0x',
    ),
  );

  return tokenFactory.computeToken(symbol);
}

async function createERC20FixedToken(address: string): Promise<void> {
  const { name, symbol } = await promptCommonMetadata();

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

async function createERC20WrappedToken(address: string): Promise<void> {
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

runScript(async () => {
  const tokenFactoryNames = Object.entries(await all()).filter(([name]) =>
    name.endsWith('TokenFactory'),
  );

  const {
    tokenFactory,
  }: {
    tokenFactory: {
      type: string;
      address: string;
    };
  } = await prompts({
    type: 'select',
    name: 'tokenFactory',
    message: 'Select token factory',
    choices: tokenFactoryNames.map(([type, { address }]) => ({
      title: type,
      value: {
        type,
        address,
      },
    })),
    initial: 0,
  });

  console.log();

  switch (tokenFactory?.type) {
    case 'ERC20ControlledTokenFactory':
      await createERC20ControlledToken(tokenFactory.address);
      break;

    case 'ERC20FixedTokenFactory':
      await createERC20FixedToken(tokenFactory.address);
      break;

    case 'ERC20WrappedTokenFactory':
      await createERC20WrappedToken(tokenFactory.address);
      break;
  }
});
