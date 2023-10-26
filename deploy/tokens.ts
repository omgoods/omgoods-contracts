import { DeployFunction } from 'hardhat-deploy/types';

const TAG = 'tokens';

const func: DeployFunction = async (hre) => {
  const {
    deployments: { log, deploy, get, read, execute },
    getNamedAccounts,
    processEnvs,
  } = hre;

  log();
  log(`# ${TAG}`);

  const { deployer, owner } = await getNamedAccounts();

  const { address: gateway } = await get('Gateway');

  const guardians = processEnvs.getAddresses('GUARDIANS');

  await deploy('TokenRegistry', {
    from: deployer,
    log: true,
    args: [
      owner,
      'OM!goods Token Registry', // name
    ],
  });

  if (await read('TokenRegistry', 'initialized')) {
    log('TokenRegistry already initialized');
  } else {
    await execute(
      'TokenRegistry',
      {
        from: owner,
        log: true,
      },
      'initialize',
      gateway,
      guardians,
    );
  }
};

func.tags = [TAG];
func.dependencies = ['gateway'];

module.exports = func;
