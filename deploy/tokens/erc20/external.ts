import { DeployFunction } from 'hardhat-deploy/types';

const TAG = 'tokens/erc20/external';

const NAME = 'External Coin';
const SYMBOL = 'EXC';
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

  await deploy('ERC20ExternalToken', {
    from: owner,
    log: true,
    args: [NAME, SYMBOL, parseEther(`${TOTAL_SUPPLY}`)],
  });
};

func.tags = [TAG];
func.skip = async ({ network }) => network.live;
func.runAtTheEnd = true;

module.exports = func;
