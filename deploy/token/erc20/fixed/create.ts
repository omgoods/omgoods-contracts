import { DeployFunction } from 'hardhat-deploy/types';

const TYPED_DATA_DOMAIN = {
  name: 'ERC20FixedTokenFactory',
  version: '1.0.0',
} as const;

const func: DeployFunction = async (hre) => {
  const {
    deployments: { log, deploy },
    getNamedAccounts,
  } = hre;

  log();
  log('# token/erc20/fixed/create');

  const { deployer: from, owner } = await getNamedAccounts();

  await deploy('ERC20FixedToken', {
    from,
    log: true,
  });

  await deploy('ERC20FixedTokenFactory', {
    from,
    log: true,
    args: [
      owner, //
      TYPED_DATA_DOMAIN.name,
      TYPED_DATA_DOMAIN.version,
    ],
  });
};

func.tags = ['create'];

module.exports = func;
