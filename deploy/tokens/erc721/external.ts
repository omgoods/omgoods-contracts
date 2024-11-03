import { DeployFunction } from 'hardhat-deploy/types';

const TAG = 'tokens/erc721/external';

const KEYS = ['A', 'B', 'C'];

const NAME_PREFIX = 'External NFT';
const SYMBOL_PREFIX = 'ExN';
const TOKEN_IDS = Array(50)
  .fill(1)
  .map((_, index) => index + 1);

const func: DeployFunction = async (hre) => {
  const {
    deployments: { log, deploy },
    getNamedAccounts,
  } = hre;

  log();
  log(`# ${TAG}`);

  const { owner } = await getNamedAccounts();

  for (const key of KEYS) {
    await deploy(`ERC721ExternalToken${key}`, {
      contract: 'ERC721ExternalToken',
      from: owner,
      log: true,
      args: [`${NAME_PREFIX} ${key}`, `${SYMBOL_PREFIX}${key}`, TOKEN_IDS],
    });
  }
};

func.tags = [TAG];
func.skip = async ({ network }) => network.live;
func.runAtTheEnd = true;

module.exports = func;
