import { DeployFunction } from 'hardhat-deploy/types';

const func: DeployFunction = async (hre) => {
  const {
    deployments: { log, deploy },
    typedData: { getDomainArgs },
    getNamedAccounts,
  } = hre;

  log();
  log('# token/erc20/fixed/create');

  const { deployer: from, owner } = await getNamedAccounts();

  await deploy('ERC20FixedTokenImpl', {
    from,
    log: true,
  });

  await deploy('ERC20FixedTokenFactory', {
    from,
    log: true,
    args: [
      owner, //
      ...getDomainArgs('ERC20FixedTokenFactory'),
    ],
  });
};

func.tags = ['create'];

module.exports = func;
