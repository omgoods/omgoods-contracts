import { DeployFunction } from 'hardhat-deploy/types';

const func: DeployFunction = async (hre) => {
  const {
    deployments: { log, deploy },
    typedData: { getDomainArgs },
    getNamedAccounts,
  } = hre;

  log();
  log('# gateway/create');

  const { deployer: from } = await getNamedAccounts();

  await deploy('Gateway', {
    from,
    log: true,
    args: getDomainArgs('Gateway'),
  });
};

func.tags = ['create'];

module.exports = func;
