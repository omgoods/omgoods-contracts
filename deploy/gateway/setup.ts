import { DeployFunction } from 'hardhat-deploy/types';

const func: DeployFunction = async (hre) => {
  const {
    deployments: { log, read, execute, get },
    getNamedAccounts,
  } = hre;

  log();
  log('# gateway/setup');

  if (await read('Gateway', 'initialized')) {
    log('Gateway already initialized');
  } else {
    const { owner: from } = await getNamedAccounts();
    const { address: accountRegistry } = await get('AccountRegistry');

    await execute(
      'Gateway',
      {
        from,
        log: true,
      },
      'initialize',
      accountRegistry,
    );
  }
};

func.tags = ['setup'];
func.dependencies = ['create'];

module.exports = func;
