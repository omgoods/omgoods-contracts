import { DeployFunction } from 'hardhat-deploy/types';

const TAG = 'tokens/erc721/external';

const NAME = 'External NFT';
const SYMBOL = 'EXN';
const TOTAL_SUPPLY = 50;

const func: DeployFunction = async (hre) => {
  const {
    deployments: { log, deploy },
    getNamedAccounts,
  } = hre;

  log();
  log(`# ${TAG}`);

  const { owner } = await getNamedAccounts();

  await deploy('ERC721ExternalToken', {
    from: owner,
    log: true,
    args: [
      NAME,
      SYMBOL,
      Array(TOTAL_SUPPLY)
        .fill(1)
        .map((_, index) => index + 1),
    ],
  });
};

func.tags = [TAG];
func.skip = async ({ network }) => network.live;
func.runAtTheEnd = true;

module.exports = func;
