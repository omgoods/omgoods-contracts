import { DeployFunction } from 'hardhat-deploy/types';
import { TypedDataDomain } from 'ethers';

const TYPED_DATA_DOMAIN: TypedDataDomain = {
  name: 'ERC20ControlledTokenFactory',
  version: '0.0.1',
} as const;

const func: DeployFunction = async (hre) => {
  const {
    deployments: { log, deploy },
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
      TYPED_DATA_DOMAIN.name,
      TYPED_DATA_DOMAIN.version,
    ],
  });
};

func.tags = ['create'];

module.exports = func;
