import { DeployFunction } from 'hardhat-deploy/types';

const TAG = 'tokens/erc20/regular';

const func: DeployFunction = async (hre) => {
  const {
    deployments: { log, deploy },
    getNamedAccounts,
  } = hre;

  log();
  log(`# ${TAG}`);

  const { deployer } = await getNamedAccounts();

  await deploy('ERC20TokenRegularImpl', {
    from: deployer,
    log: true,
    args: [
      'OM!goods Regular Coin', //
    ],
  });
};

func.tags = [TAG];
func.dependencies = ['tokens/factory'];

module.exports = func;
