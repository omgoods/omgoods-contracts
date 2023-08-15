import { DeployFunction } from 'hardhat-deploy/types';

const func: DeployFunction = async (hre) => {
  const {
    deployments: { log, read, execute, get },
    getNamedAccounts,
  } = hre;

  log();
  log('# token/erc20/controlled/setup');

  if (await read('ERC20ControlledTokenFactory', 'initialized')) {
    log('ERC20ControlledTokenFactory already initialized');
  } else {
    const { owner: from } = await getNamedAccounts();
    const { address: gateway } = await get('Gateway');
    const { address: tokenRegistry } = await get('ERC20TokenRegistry');
    const { address: tokenImpl } = await get('ERC20ControlledTokenImpl');

    await execute(
      'ERC20ControlledTokenFactory',
      {
        from,
        log: true,
      },
      'initialize',
      gateway,
      tokenRegistry,
      tokenImpl,
    );
  }
};

func.tags = ['setup'];
func.dependencies = ['create'];

module.exports = func;
