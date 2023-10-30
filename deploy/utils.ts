import { DeployFunction } from 'hardhat-deploy/types';

const TAG = 'utils';

const func: DeployFunction = async (hre) => {
  const {
    deployments: { log, deploy },
    getNamedAccounts,
  } = hre;

  log();
  log(`# ${TAG}`);

  const { deployer } = await getNamedAccounts();

  await deploy('StaticCaller', {
    from: deployer,
    log: true,
  });
};

func.tags = [TAG];

module.exports = func;
