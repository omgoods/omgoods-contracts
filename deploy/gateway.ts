import { DeployFunction } from 'hardhat-deploy/types';

const func: DeployFunction = async (hre) => {
  const {
    network: { live },
    deployments: { log, deploy },
    getNamedAccounts,
  } = hre;

  log();
  log('# gateway');

  const { deployer } = await getNamedAccounts();

  await deploy('Gateway', {
    from: deployer,
    log: true,
    args: [
      'OM!goods Gateway', // name
      '0.0.1', // version
    ],
  });

  if (live) {
    return;
  }
};

func.tags = ['gateway'];

module.exports = func;
