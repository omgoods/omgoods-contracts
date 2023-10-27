import { DeployFunction } from 'hardhat-deploy/types';

const TAG = 'tokens/erc20/default';

const func: DeployFunction = async (hre) => {
  const {
    deployments: { log, deploy, get, read, execute },
    getNamedAccounts,
  } = hre;

  log();
  log(`# ${TAG}`);

  const { deployer, owner } = await getNamedAccounts();

  const { address: gateway } = await get('Gateway');
  const { address: tokenRegistry } = await get('TokenRegistry');

  const { address: tokenImpl } = await deploy('ERC20DefaultTokenImpl', {
    from: deployer,
    log: true,
  });

  const { address: tokenFactory } = await deploy('ERC20DefaultTokenFactory', {
    contract: 'DefaultTokenFactory',
    from: deployer,
    log: true,
    args: [owner],
  });

  if (await read('ERC20DefaultTokenFactory', 'initialized')) {
    log('ERC20DefaultTokenFactory already initialized');
  } else {
    await execute(
      'ERC20DefaultTokenFactory',
      {
        from: owner,
        log: true,
      },
      'initialize',
      gateway,
      tokenImpl,
      tokenRegistry,
    );
  }

  if (await read('TokenRegistry', 'hasTokenFactory', tokenFactory)) {
    log('ERC20DefaultTokenFactory already in TokenRegistry');
  } else {
    await execute(
      'TokenRegistry',
      {
        from: owner,
        log: true,
      },
      'addTokenFactory',
      tokenFactory,
    );
  }
};

func.tags = [TAG];
func.dependencies = ['tokens/registry'];

module.exports = func;
