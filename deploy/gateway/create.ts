import { DeployFunction } from 'hardhat-deploy/types';

const func: DeployFunction = async (hre) => {
  const {
    deployments: { log, deploy },
    getNamedAccounts,
    getTypedDataDomain,
  } = hre;

  log();
  log('# gateway/create');

  const { deployer: from } = await getNamedAccounts();

  const typeDataDomain = getTypedDataDomain('Gateway');

  await deploy('Gateway', {
    from,
    log: true,
    args: [typeDataDomain.name, typeDataDomain.version],
  });
};

func.tags = ['create'];

module.exports = func;
