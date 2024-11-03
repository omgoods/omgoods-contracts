import { DeployFunction } from 'hardhat-deploy/types';

const TAG = 'tokens/factory';

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

  const { address: target } = await deploy('TokenTarget', {
    contract: 'CloneTarget',
    from: deployer,
    log: true,
  });

  await deploy('TokenFactory', {
    from: deployer,
    log: true,
    args: [
      'OM!goods Token Factory', // name
      owner,
      target,
    ],
  });

  if (await read('TokenFactory', 'isInitialized')) {
    log('TokenFactory already initialized');
  } else {
    await execute(
      'TokenFactory',
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
func.dependencies = ['tokens/helper'];

module.exports = func;
