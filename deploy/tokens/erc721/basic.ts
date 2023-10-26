import { DeployFunction } from 'hardhat-deploy/types';

const TAG = 'tokens/erc721/basic';

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

  const { address: tokenImpl } = await deploy('ERC721BasicTokenImpl', {
    from: deployer,
    log: true,
  });

  await deploy('ERC721BasicTokenFactory', {
    contract: 'BasicTokenFactory',
    from: deployer,
    log: true,
    args: [owner],
  });

  if (await read('ERC721BasicTokenFactory', 'initialized')) {
    log('ERC721BasicTokenFactory already initialized');
  } else {
    await execute(
      'ERC721BasicTokenFactory',
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
func.dependencies = ['tokens/erc20/wrapped'];

module.exports = func;
