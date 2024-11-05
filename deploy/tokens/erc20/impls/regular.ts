import { DeployFunction } from 'hardhat-deploy/types';

const TAG = 'tokens/erc20/impls/regular';
const VERSION = '00-initial';

const func: DeployFunction = async (hre) => {
  const {
    deployments: { logHeader, deploy },
    getNamedAccounts,
  } = hre;

  logHeader(TAG, VERSION);

  const { deployer } = await getNamedAccounts();

  await deploy('ERC20TokenRegularImpl', {
    from: deployer,
    log: true,
    args: [
      'OM!goods Regular Coin', //
    ],
  });
};

func.tags = [TAG, VERSION];
func.dependencies = ['tokens/erc20/factory'];

module.exports = func;
