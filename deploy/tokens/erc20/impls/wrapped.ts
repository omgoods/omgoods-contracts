import { DeployFunction } from 'hardhat-deploy/types';

const TAG = 'tokens/erc20/impls/wrapped';

const func: DeployFunction = async (hre) => {
  const {
    deployments: { log, deploy },
    getNamedAccounts,
  } = hre;

  log();
  log(`# ${TAG}`);

  const { deployer } = await getNamedAccounts();

  await deploy('ERC20TokenWrappedImpl', {
    from: deployer,
    log: true,
    args: [
      'OM!goods Wrapped Coin', //
    ],
  });
};

func.tags = [TAG];
func.dependencies = ['tokens/erc20/impls/regular'];

module.exports = func;
