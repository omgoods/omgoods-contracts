import { DeployFunction } from 'hardhat-deploy/types';

const TAG = 'tokens/registry';

const func: DeployFunction = async (hre) => {
  const {
    deployments: { log, deploy, read, execute, getAddress },
    getNamedAccounts,
    processEnvs,
  } = hre;

  log();
  log(`# ${TAG}`);

  const { deployer, owner } = await getNamedAccounts();

  const forwarder = await getAddress('Forwarder');

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
      forwarder,
      guardians,
    );
  }
};

func.tags = [TAG];
func.dependencies = ['forwarder'];

module.exports = func;
