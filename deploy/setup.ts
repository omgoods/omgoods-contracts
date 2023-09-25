import { DeployFunction } from 'hardhat-deploy/types';

const func: DeployFunction = async (hre) => {
  const {
    deployments: { log, read, execute, get },
    getNamedAccounts,
  } = hre;

  log();
  log('# setup');

  if (await read('ERC20FixedTokenFactory', 'initialized')) {
    log('ERC20FixedTokenFactory already initialized');
  } else {
    const { owner: from } = await getNamedAccounts();
    const { address: gateway } = await get('Gateway');
    const { address: tokenImpl } = await get('ERC20FixedTokenImpl');

    await execute(
      'ERC20FixedTokenFactory',
      {
        from,
        log: true,
      },
      'initialize',
      gateway,
      tokenImpl,
    );
  }
};

func.tags = ['setup'];
func.dependencies = ['create'];

module.exports = func;
