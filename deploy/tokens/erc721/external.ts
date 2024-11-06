import { DeployFunction } from 'hardhat-deploy/types';

const TAG = 'tokens/erc721/external';
const VERSION = '00-initial';

const KEYS = ['A', 'B', 'C'];

const NAME_PREFIX = 'External NFT';
const SYMBOL_PREFIX = 'ExN';
const TOKEN_IDS = Array(50)
  .fill(1)
  .map((_, index) => index + 1);

const func: DeployFunction = async (hre) => {
  const {
    deployments: { logHeader, deploy },
    getNamedAccounts,
  } = hre;

  logHeader(TAG, VERSION);

  const { faucet } = await getNamedAccounts();

  for (const key of KEYS) {
    await deploy(`ERC721ExternalToken${key}`, {
      contract: 'ERC721ExternalToken',
      from: faucet,
      log: true,
      args: [`${NAME_PREFIX} ${key}`, `${SYMBOL_PREFIX}${key}`, TOKEN_IDS],
    });
  }
};

func.tags = [TAG, VERSION];
func.skip = async ({ network }) => network.config.type !== 'localnet';
func.runAtTheEnd = true;

module.exports = func;
