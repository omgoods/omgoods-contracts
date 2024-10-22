import { DeployFunction } from 'hardhat-deploy/types';

const TAG = 'tokens/erc20/default';

const TOKEN_TYPE = 'ERC20';
const TOKEN_FACTORY_TYPE = 'Default';
const CONTRACT_PREFIX = `${TOKEN_TYPE}Token${TOKEN_FACTORY_TYPE}`;

const func: DeployFunction = async (hre) => {
  const {
    deployments: { log, deploy, read, execute, getAddress },
    getNamedAccounts,
  } = hre;

  log();
  log(`# ${TAG}`);

  const { deployer, owner } = await getNamedAccounts();

  const forwarder = await getAddress('Forwarder');
  const tokenRegistry = await getAddress('TokenRegistry');

  const { address: tokenImpl } = await deploy(`${CONTRACT_PREFIX}Impl`, {
    from: deployer,
    log: true,
  });

  const { address: tokenFactory } = await deploy(`${CONTRACT_PREFIX}Factory`, {
    contract: `Token${TOKEN_FACTORY_TYPE}Factory`,
    from: deployer,
    log: true,
    args: [owner],
  });

  if (await read(`${CONTRACT_PREFIX}Factory`, 'initialized')) {
    log(`${CONTRACT_PREFIX}Factory  already initialized`);
  } else {
    await execute(
      `${CONTRACT_PREFIX}Factory`,
      {
        from: owner,
        log: true,
      },
      'initialize',
      forwarder,
      tokenImpl,
      tokenRegistry,
    );
  }

  if (await read('TokenRegistry', 'hasTokenFactory', tokenFactory)) {
    log(`${CONTRACT_PREFIX}Factory  already in TokenRegistry`);
  } else {
    await execute(
      'TokenRegistry',
      {
        from: owner,
        log: true,
      },
      'addTokenFactory',
      tokenFactory,
    );
  }
};

func.tags = [TAG];
func.dependencies = ['tokens/registry'];

module.exports = func;
