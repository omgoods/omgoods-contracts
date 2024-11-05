import { DeployFunction } from 'hardhat-deploy/types';

const TAG = 'tokens/erc721/impls/regular';
const VERSION = '00-initial';

const func: DeployFunction = async (hre) => {
  const {
    deployments: { logHeader, deploy },
    getNamedAccounts,
  } = hre;

  logHeader(TAG, VERSION);

  const { deployer } = await getNamedAccounts();

  await deploy('ERC721TokenRegularImpl', {
    from: deployer,
    log: true,
    args: [
      'OM!goods Regular NFT', //
    ],
  });
};

func.tags = [TAG, VERSION];
func.dependencies = ['tokens/erc721/factory'];

module.exports = func;
