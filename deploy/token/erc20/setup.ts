import { DeployFunction } from 'hardhat-deploy/types';

const TOKENS = [] as const;

const TOKEN_FACTORIES = [
  'ERC20FixedTokenFactory', //
] as const;

const func: DeployFunction = async (hre) => {
  const {
    deployments: { log, read, execute, get },
    getNamedAccounts,
    getUnnamedAccounts,
  } = hre;

  log();
  log('# token/erc20/setup');

  const { owner: from } = await getNamedAccounts();

  if (await read('ERC20TokenRegistry', 'initialized')) {
    log('ERC20TokenRegistry already initialized');
  } else {
    const guardians = await getUnnamedAccounts();

    await execute(
      'ERC20TokenRegistry',
      {
        from,
        log: true,
      },
      'initialize',
      guardians,
    );
  }

  for (const tokenName of TOKENS) {
    const { address: token } = await get(tokenName);

    if (await read('ERC20TokenRegistry', 'hasToken', token)) {
      log(`${tokenName} already in ERC20TokenRegistry`);
    } else {
      await execute(
        'ERC20TokenRegistry',
        {
          from,
          log: true,
        },
        'addToken',
        token,
      );
    }
  }

  for (const tokenFactoryName of TOKEN_FACTORIES) {
    const { address: tokenFactory } = await get(tokenFactoryName);

    if (await read('ERC20TokenRegistry', 'hasTokenFactory', tokenFactory)) {
      log(`${tokenFactoryName} already in ERC20TokenRegistry`);
    } else {
      await execute(
        'ERC20TokenRegistry',
        {
          from,
          log: true,
        },
        'addTokenFactory',
        tokenFactory,
      );
    }
  }
};

func.tags = ['setup'];
func.dependencies = ['create'];

module.exports = func;
