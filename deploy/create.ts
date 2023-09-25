import { DeployFunction } from 'hardhat-deploy/types';

const func: DeployFunction = async (hre) => {
  const {
    deployments: { log, deploy },
    getNamedAccounts,
  } = hre;

  log();
  log('# create');

  const { deployer: from, owner } = await getNamedAccounts();

  await deploy('Gateway', {
    from,
    log: true,
    args: ['OM!goods Gateway', '0.0.1'],
  });

  await deploy('ERC20FixedTokenImpl', {
    from,
    log: true,
  });

  await deploy('ERC20FixedTokenFactory', {
    from,
    log: true,
    args: [owner, 'OM!goods ERC20 Fixed Token Factory', '0.0.1'],
  });
};

func.tags = ['create'];

module.exports = func;
