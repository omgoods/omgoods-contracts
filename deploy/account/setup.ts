import { DeployFunction } from 'hardhat-deploy/types';

const func: DeployFunction = async (hre) => {
  const {
    deployments: { log, read, execute, get },
    getNamedAccounts,
    ethers: { ZeroAddress },
  } = hre;

  log();
  log('# account/setup');

  if (await read('AccountRegistry', 'initialized')) {
    log('AccountRegistry already initialized');
  } else {
    const { owner: from } = await getNamedAccounts();
    const { address: gateway } = await get('Gateway');
    const { address: accountImplementation } = await get('Account');

    await execute(
      'AccountRegistry',
      {
        from,
        log: true,
      },
      'initialize',
      gateway,
      ZeroAddress, // TODO: add entry point address
      accountImplementation,
    );
  }
};

func.tags = ['setup'];
func.dependencies = ['create'];

module.exports = func;
