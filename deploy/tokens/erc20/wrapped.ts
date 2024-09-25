import { DeployFunction } from 'hardhat-deploy/types';

const TAG = 'tokens/erc20/wrapped';

const func: DeployFunction = async (hre) => {
  const {
    deployments: { log, deploy, read, execute, getAddress },
    getNamedAccounts,
  } = hre;

  log();
  log(`# ${TAG}`);

  const { deployer, owner } = await getNamedAccounts();

  const forwarder = await getAddress('Forwarder');
  const tokenRegistry = await getAddress('TokenRegistry');

  const { address: tokenImpl } = await deploy('ERC20WrappedTokenImpl', {
    from: deployer,
    log: true,
  });

  const { address: tokenFactory } = await deploy('ERC20WrappedTokenFactory', {
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
      forwarder,
      tokenImpl,
      tokenRegistry,
    );
  }

  if (await read('TokenRegistry', 'hasTokenFactory', tokenFactory)) {
    log('ERC20WrappedTokenFactory already in TokenRegistry');
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
func.dependencies = ['tokens/erc20/default'];

module.exports = func;
