import { DeployFunction } from 'hardhat-deploy/types';

const func: DeployFunction = async (hre) => {
  const {
    deployments: { log, deploy },
    getNamedAccounts,
  } = hre;

  log();
  log('# account/create');

  const { deployer: from, owner } = await getNamedAccounts();

  await deploy('AccountImpl', {
    from,
    log: true,
    deterministicDeployment: true,
  });

  await deploy('AccountRegistry', {
    from,
    log: true,
    deterministicDeployment: true,
    args: [owner],
  });
};

func.tags = ['create'];

module.exports = func;
