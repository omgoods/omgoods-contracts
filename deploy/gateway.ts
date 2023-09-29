import { DeployFunction } from 'hardhat-deploy/types';

const func: DeployFunction = async (hre) => {
  const {
    deployments: { log, deploy },
    getNamedAccounts,
  } = hre;

  log();
  log('# gateway');

  const { deployer } = await getNamedAccounts();

  await deploy('Gateway', {
    from: deployer, // nonce 0
    log: true,
    args: [
      'OM!goods Gateway', // name
      '0.0.1', // version
    ],
  });
};

func.tags = ['gateway'];

module.exports = func;
