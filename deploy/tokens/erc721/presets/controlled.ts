import { DeployFunction } from 'hardhat-deploy/types';

const FACTORY_NAME = 'Controlled';
const TAG = `tokens/erc721/presets/${FACTORY_NAME.toLowerCase()}`;

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

  const tokenFactory = `ERC721${FACTORY_NAME}TokenFactory`;

  const { address: tokenImpl } = await deploy(
    `ERC721${FACTORY_NAME}TokenImpl`,
    {
      from: deployer, // nonce 7
      log: true,
    },
  );

  await deploy(tokenFactory, {
    from: deployer, // nonce 8
    log: true,
    args: [
      owner,
      `OM!goods ERC721 ${FACTORY_NAME} Token Factory`, // name
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
      processEnvs.getUrl('ERC721_BASE_URL'),
    );
  }
};

func.tags = [TAG];
func.dependencies = ['tokens/erc20/presets/wrapped'];

module.exports = func;
