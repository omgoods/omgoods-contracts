import { DeployFunction } from 'hardhat-deploy/types';

const func: DeployFunction = async (hre) => {
  const {
    deployments: { log, deploy },
    typedData: { getDomainArgs },
    getNamedAccounts,
  } = hre;

  log();
  log('# token/erc20/wrapped/create');

  const { deployer: from, owner } = await getNamedAccounts();

  await deploy('ERC20WrappedTokenImpl', {
    from,
    log: true,
  });

  await deploy('ERC20WrappedTokenFactory', {
    from,
    log: true,
    args: [
      owner, //
      ...getDomainArgs('ERC20WrappedTokenFactory'),
    ],
  });
};

func.tags = ['create'];

module.exports = func;
