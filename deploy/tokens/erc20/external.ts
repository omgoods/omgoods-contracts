import { DeployFunction } from 'hardhat-deploy/types';

const TAG = 'tokens/erc20/external';
const VERSION = '00-initial';

const KEYS = ['A', 'B', 'C', 'D', 'E'];

const NAME_PREFIX = 'External Coin';
const SYMBOL_PREFIX = 'ExC';
const TOTAL_SUPPLY = 100_000_000;

const func: DeployFunction = async (hre) => {
  const {
    deployments: { logHeader, deploy },
    ethers: { parseEther },
    getNamedAccounts,
  } = hre;

  logHeader(TAG, VERSION);

  const { faucet } = await getNamedAccounts();

  for (const key of KEYS) {
    await deploy(`ERC20ExternalToken${key}`, {
      contract: 'ERC20ExternalToken',
      from: faucet,
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
func.skip = async ({ network }) => network.live;
func.runAtTheEnd = true;

module.exports = func;
