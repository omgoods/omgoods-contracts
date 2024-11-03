import { DeployFunction } from 'hardhat-deploy/types';

const TAG = 'tokens/erc20/external';

const KEYS = ['A', 'B', 'C', 'D', 'E'];

const NAME_PREFIX = 'External Coin';
const SYMBOL_PREFIX = 'ExC';
const TOTAL_SUPPLY = 100_000_000;

const func: DeployFunction = async (hre) => {
  const {
    deployments: { log, deploy },
    ethers: { parseEther },
    getNamedAccounts,
  } = hre;

  log();
  log(`# ${TAG}`);

  const { owner } = await getNamedAccounts();

  for (const key of KEYS) {
    await deploy(`ERC20ExternalToken${key}`, {
      contract: 'ERC20ExternalToken',
      from: owner,
      log: true,
      args: [
        `${NAME_PREFIX} ${key}`,
        `${SYMBOL_PREFIX}${key}`,
        parseEther(`${TOTAL_SUPPLY}`),
      ],
    });
  }
};

func.tags = [TAG];
func.skip = async ({ network }) => network.live;
func.runAtTheEnd = true;

module.exports = func;
