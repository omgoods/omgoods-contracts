import { DeployFunction } from 'hardhat-deploy/types';

const func: DeployFunction = async (hre) => {
  const {
    deployments: { log, deploy },
    getNamedAccounts,
  } = hre;

  log();
  log('# token/erc20/create');

  const { deployer: from, owner } = await getNamedAccounts();

  await deploy('ERC20TokenRegistry', {
    from,
    log: true,
    deterministicDeployment: true,
    args: [owner],
  });
};

func.tags = ['create'];

module.exports = func;
