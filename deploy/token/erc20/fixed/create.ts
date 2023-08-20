import { DeployFunction } from 'hardhat-deploy/types';

const func: DeployFunction = async (hre) => {
  const {
    deployments: { log, deploy },
    getNamedAccounts,
    getTypedDataDomain,
  } = hre;

  log();
  log('# token/erc20/fixed/create');

  const { deployer: from, owner } = await getNamedAccounts();

  const typeDataDomain = getTypedDataDomain('ERC20FixedTokenFactory');

  await deploy('ERC20FixedTokenImpl', {
    from,
    log: true,
  });

  await deploy('ERC20FixedTokenFactory', {
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
