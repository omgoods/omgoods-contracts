import { DeployFunction } from 'hardhat-deploy/types';

const TOKEN_TYPE = 'Fixed';
const TOKEN_TAG = `tokens/erc20/${TOKEN_TYPE.toLowerCase()}`;

const func: DeployFunction = async (hre) => {
  const {
    deployments: { log, deploy, read, get, execute },
    getNamedAccounts,
  } = hre;

  log();
  log(`# ${TOKEN_TAG}`);

  const { deployer, owner } = await getNamedAccounts();

  const { address: gateway } = await get('Gateway');

  const tokenFactory = `ERC20${TOKEN_TYPE}TokenFactory`;

  const { address: tokenImpl } = await deploy(`ERC20${TOKEN_TYPE}TokenImpl`, {
    from: deployer, // nonce 3
    log: true,
  });

  await deploy(tokenFactory, {
    from: deployer, // nonce 4
    log: true,
    args: [
      owner,
      `OM!goods ERC20 ${TOKEN_TYPE} Token Factory`, // name
    ],
  });

  if (await read(tokenFactory, 'initialized')) {
    log(`${tokenFactory} already initialized`);
  } else {
    await execute(
      tokenFactory,
      {
        from: owner,
        log: true,
      },
      'initialize',
      gateway,
      [], // guardians
      tokenImpl,
    );
  }
};

func.tags = [TOKEN_TAG];
func.dependencies = ['tokens/erc20/controlled'];

module.exports = func;