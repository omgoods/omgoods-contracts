import { DeployFunction } from 'hardhat-deploy/types';

const TAG = 'proxy/clone';
const VERSION = '00-initial';

const func: DeployFunction = async (hre) => {
  const {
    deployments: { logHeader, deploy },
    getNamedAccounts,
  } = hre;

  logHeader(TAG, VERSION);

  const { deployer } = await getNamedAccounts();

  await deploy('CloneTarget', {
    from: deployer,
    log: true,
  });
};

func.tags = [TAG, VERSION];

module.exports = func;
