import { DeployFunction } from 'hardhat-deploy/types';

const TAG = 'metatx/forwarder';
const VERSION = '00-initial';

const func: DeployFunction = async (hre) => {
  const {
    deployments: { deploy, logHeader },
    getNamedAccounts,
  } = hre;

  logHeader(TAG, VERSION);

  const { deployer } = await getNamedAccounts();

  await deploy('Forwarder', {
    from: deployer,
    log: true,
    args: [
      'OM!goods Forwarder', // name
    ],
  });
};

func.tags = [TAG, VERSION];

module.exports = func;
