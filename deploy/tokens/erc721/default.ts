import { DeployFunction } from 'hardhat-deploy/types';

const TAG = 'tokens/erc721/default';

const func: DeployFunction = async (hre) => {
  const {
    deployments: { log, deploy, get, read, execute },
    getNamedAccounts,
  } = hre;

  log();
  log(`# ${TAG}`);

  const { deployer, owner } = await getNamedAccounts();

  const { address: forwarder } = await get('Forwarder');
  const { address: tokenRegistry } = await get('TokenRegistry');

  const { address: tokenImpl } = await deploy('ERC721DefaultTokenImpl', {
    from: deployer,
    log: true,
  });

  const { address: tokenFactory } = await deploy('ERC721DefaultTokenFactory', {
    contract: 'DefaultTokenFactory',
    from: deployer,
    log: true,
    args: [owner],
  });

  if (await read('ERC721DefaultTokenFactory', 'initialized')) {
    log('ERC721DefaultTokenFactory already initialized');
  } else {
    await execute(
      'ERC721DefaultTokenFactory',
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
    log('ERC721DefaultTokenFactory already in TokenRegistry');
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
func.dependencies = ['tokens/erc20/wrapped'];

module.exports = func;
