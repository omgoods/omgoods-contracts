import { DeployFunction } from 'hardhat-deploy/types';

const func: DeployFunction = async (hre) => {
  const {
    deployments: { log, deploy },
    typedData: { getDomainArgs },
    getNamedAccounts,
  } = hre;

  log();
  log('# token/erc20/controlled/create');

  const { deployer: from, owner } = await getNamedAccounts();

  await deploy('ERC20ControlledTokenImpl', {
    from,
    log: true,
  });

  await deploy('ERC20ControlledTokenFactory', {
    from,
    log: true,
    args: [
      owner, //
      ...getDomainArgs('ERC20ControlledTokenFactory'),
    ],
  });
};

func.tags = ['create'];

module.exports = func;
