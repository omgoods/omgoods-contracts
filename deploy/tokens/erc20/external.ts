import { DeployFunction } from 'hardhat-deploy/types';

const TAG = 'tokens/erc20/external';
const VERSION = '00-initial';

const NAME_PREFIX = 'External Coin';
const SYMBOL_PREFIX = 'ExC';
const TOTAL_SUPPLY = 100_000_000;

const func: DeployFunction = async (hre) => {
  const {
    config: {
      tokens: { externalKeys },
    },
    deployments: { logHeader, deploy },
    ethers: { parseEther },
    getNamedAccounts,
  } = hre;

  logHeader(TAG, VERSION);

  const { owner } = await getNamedAccounts();

  for (const key of externalKeys) {
    await deploy(`ERC20ExternalToken${key}`, {
      contract: 'ERC20ExternalToken',
      from: owner,
      log: true,
      args: [
        `${NAME_PREFIX} ${key}`,
        `${SYMBOL_PREFIX}${key}`,
        18,
        parseEther(`${TOTAL_SUPPLY}`),
      ],
    });
  }
};

func.tags = [TAG, VERSION];
func.skip = async ({ network }) => network.config.type !== 'localnet';
func.runAtTheEnd = true;

module.exports = func;
