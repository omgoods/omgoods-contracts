import { DeployFunction } from 'hardhat-deploy/types';

const func: DeployFunction = async (hre) => {
  const {
    deployments: { log, deploy },
    getNamedAccounts,
  } = hre;

  log();
  log('# account/create');

  const { deployer: from, owner } = await getNamedAccounts();

  await deploy('Account', {
    from,
    log: true,
  });

  await deploy('AccountRegistry', {
    from,
    log: true,
    args: [owner],
  });
};

func.tags = ['create'];

module.exports = func;
