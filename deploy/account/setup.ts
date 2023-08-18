import { DeployFunction } from 'hardhat-deploy/types';

const func: DeployFunction = async (hre) => {
  const {
    deployments: { log, read, execute, getAddress },
    getNamedAccounts,
    ethers: { ZeroAddress },
  } = hre;

  log();
  log('# account/setup');

  if (await read('AccountRegistry', 'initialized')) {
    log('AccountRegistry already initialized');
  } else {
    const { owner: from } = await getNamedAccounts();
    const gateway = await getAddress('Gateway');
    const accountImpl = await getAddress('AccountImpl');

    await execute(
      'AccountRegistry',
      {
        from,
        log: true,
      },
      'initialize',
      gateway,
      ZeroAddress, // unsupported yet
      accountImpl,
    );
  }
};

func.tags = ['setup'];
func.dependencies = ['create'];

module.exports = func;
