import { DeployFunction } from 'hardhat-deploy/types';

const TAG = 'tokens/erc20/wrapped';

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

  const { address: tokenImpl } = await deploy('ERC20WrappedTokenImpl', {
    from: deployer,
    log: true,
  });

  await deploy('ERC20WrappedTokenFactory', {
    contract: 'WrappedTokenFactory',
    from: deployer,
    log: true,
    args: [owner],
  });

  if (await read('ERC20WrappedTokenFactory', 'initialized')) {
    log('ERC20WrappedTokenFactory already initialized');
  } else {
    await execute(
      'ERC20WrappedTokenFactory',
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
};

func.tags = [TAG];
func.dependencies = ['tokens/erc20/basic'];

module.exports = func;
