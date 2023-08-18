import { DeployFunction } from 'hardhat-deploy/types';

const func: DeployFunction = async (hre) => {
  const {
    deployments: { log, read, execute, getAddress },
    getNamedAccounts,
  } = hre;

  log();
  log('# token/erc20/wrapped/setup');

  if (await read('ERC20WrappedTokenFactory', 'initialized')) {
    log('ERC20WrappedTokenFactory already initialized');
  } else {
    const { owner: from } = await getNamedAccounts();
    const gateway = await getAddress('Gateway');
    const tokenRegistry = await getAddress('ERC20TokenRegistry');
    const tokenImpl = await getAddress('ERC20WrappedTokenImpl');

    await execute(
      'ERC20WrappedTokenFactory',
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
