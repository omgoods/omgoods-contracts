import { DeployFunction } from 'hardhat-deploy/types';

const TAG = 'tokens/helper';

const func: DeployFunction = async (hre) => {
  const {
    deployments: { log, deploy },
    getNamedAccounts,
  } = hre;

  log();
  log(`# ${TAG}`);

  const { deployer } = await getNamedAccounts();

  await deploy('TokenHelper', {
    from: deployer,
    log: true,
  });
};

func.tags = [TAG];
func.dependencies = ['metatx/forwarder'];

module.exports = func;
