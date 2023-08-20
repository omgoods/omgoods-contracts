import { DeployFunction } from 'hardhat-deploy/types';

const func: DeployFunction = async (hre) => {
  const {
    deployments: { log, deploy },
    getNamedAccounts,
    getTypedDataDomain,
  } = hre;

  log();
  log('# token/erc20/controlled/create');

  const { deployer: from, owner } = await getNamedAccounts();

  const typeDataDomain = getTypedDataDomain('ERC20ControlledTokenFactory');

  await deploy('ERC20ControlledTokenImpl', {
    from,
    log: true,
  });

  await deploy('ERC20ControlledTokenFactory', {
    from,
    log: true,
    args: [
      owner, //
      typeDataDomain.name,
      typeDataDomain.version,
    ],
  });
};

func.tags = ['create'];

module.exports = func;
