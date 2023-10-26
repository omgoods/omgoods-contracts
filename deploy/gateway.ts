import { DeployFunction } from 'hardhat-deploy/types';

const TAG = 'gateway';

const func: DeployFunction = async (hre) => {
  const {
    deployments: { log, deploy },
    getNamedAccounts,
  } = hre;

  log();
  log(`# ${TAG}`);

  const { deployer } = await getNamedAccounts();

  await deploy('Gateway', {
    from: deployer,
    log: true,
    args: [
      'OM!goods Gateway', // name
    ],
  });
};

func.tags = [TAG];

module.exports = func;
