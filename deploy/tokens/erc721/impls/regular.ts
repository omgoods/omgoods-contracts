import { DeployFunction } from 'hardhat-deploy/types';

const TAG = 'tokens/erc721/regular';

const func: DeployFunction = async (hre) => {
  const {
    deployments: { log, deploy },
    getNamedAccounts,
  } = hre;

  log();
  log(`# ${TAG}`);

  const { deployer } = await getNamedAccounts();

  await deploy('ERC721TokenRegularImpl', {
    from: deployer,
    log: true,
    args: [
      'OM!goods Regular NFT', //
    ],
  });
};

func.tags = [TAG];
func.dependencies = ['tokens/erc20/wrapped'];

module.exports = func;
