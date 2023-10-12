import { DeployFunction } from 'hardhat-deploy/types';

const FACTORY_NAME = 'Wrapped';
const TAG = `tokens/erc20/presets/${FACTORY_NAME.toLowerCase()}`;

const func: DeployFunction = async (hre) => {
  const {
    deployments: { log, deploy, read, get, execute },
    getNamedAccounts,
    processEnvs,
  } = hre;

  log();
  log(`# ${TAG}`);

  const { deployer, owner } = await getNamedAccounts();

  const { address: gateway } = await get('Gateway');

  const tokenFactory = `ERC20${FACTORY_NAME}TokenFactory`;

  const { address: tokenImpl } = await deploy(`ERC20${FACTORY_NAME}TokenImpl`, {
    from: deployer, // nonce 5
    log: true,
  });

  await deploy(tokenFactory, {
    from: deployer, // nonce 6
    log: true,
    args: [
      owner,
      `OM!goods ERC20 ${FACTORY_NAME} Token Factory`, // name
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
      processEnvs.getAddresses('GUARDIANS'),
      tokenImpl,
    );
  }
};

func.tags = [TAG];
func.dependencies = ['tokens/erc20/presets/fixed'];

module.exports = func;
