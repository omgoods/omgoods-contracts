import { DeployFunction } from 'hardhat-deploy/types';

const TAG = 'metatx/forwarder';

const func: DeployFunction = async (hre) => {
  const {
    deployments: { log, deploy },
    getNamedAccounts,
  } = hre;

  log();
  log(`# ${TAG}`);

  const { deployer } = await getNamedAccounts();

  await deploy('Forwarder', {
    from: deployer,
    log: true,
    args: [
      'OM!goods Forwarder', // name
    ],
  });
};

func.tags = [TAG];
func.dependencies = ['utils'];

module.exports = func;
