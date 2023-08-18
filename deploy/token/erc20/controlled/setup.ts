import { DeployFunction } from 'hardhat-deploy/types';

const func: DeployFunction = async (hre) => {
  const {
    deployments: { log, read, execute, getAddress },
    getNamedAccounts,
  } = hre;

  log();
  log('# token/erc20/controlled/setup');

  if (await read('ERC20ControlledTokenFactory', 'initialized')) {
    log('ERC20ControlledTokenFactory already initialized');
  } else {
    const { owner: from } = await getNamedAccounts();
    const gateway = await getAddress('Gateway');
    const tokenRegistry = await getAddress('ERC20TokenRegistry');
    const tokenImpl = await getAddress('ERC20ControlledTokenImpl');

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
