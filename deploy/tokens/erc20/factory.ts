import { DeployFunction } from 'hardhat-deploy/types';

const TAG = 'tokens/erc20/factory';
const VERSION = '00-initial';

const func: DeployFunction = async (hre) => {
  const {
    deployments: { log, logHeader, deploy, read, execute, getAddress },
    getNamedAccounts,
    processEnvs,
  } = hre;

  logHeader(TAG, VERSION);

  const { deployer, owner } = await getNamedAccounts();

  const target = await getAddress('CloneTarget');
  const forwarder = await getAddress('Forwarder');

  const guardians = processEnvs.getAddresses('GUARDIANS');

  await deploy('ERC20TokenFactory', {
    contract: 'TokenFactory',
    from: deployer,
    log: true,
    args: [
      'OM!goods Coin Factory', // name
      owner,
      target,
    ],
  });

  if (await read('ERC20TokenFactory', 'isInitialized')) {
    log('ERC20TokenFactory already initialized');
  } else {
    await execute(
      'ERC20TokenFactory',
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

func.tags = [TAG, VERSION];
func.dependencies = ['proxy/clone', 'metatx/forwarder', 'tokens/helper'];

module.exports = func;
