import { DeployFunction } from 'hardhat-deploy/types';

const TAG = 'tokens/erc20/basic';

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

  const { address: tokenImpl } = await deploy('ERC20BasicTokenImpl', {
    from: deployer, // nonce 1
    log: true,
  });

  await deploy('ERC20BasicTokenFactory', {
    contract: 'BasicTokenFactory',
    from: deployer, // nonce 2
    log: true,
    args: [owner],
  });

  if (await read('ERC20BasicTokenFactory', 'initialized')) {
    log('ERC20BasicTokenFactory already initialized');
  } else {
    await execute(
      'ERC20BasicTokenFactory',
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
func.dependencies = ['tokens'];

module.exports = func;
