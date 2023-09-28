import { DeployFunction } from 'hardhat-deploy/types';

const TYPES = [
  'Controlled', //
  'Fixed',
  'Wrapped',
];

const func: DeployFunction = async (hre) => {
  const {
    deployments: { log, deploy, get, read, execute },
    getNamedAccounts,
  } = hre;

  log();
  log('# token/erc20');

  const { deployer, owner } = await getNamedAccounts();

  const { address: gateway } = await get('Gateway');

  for (const type of TYPES) {
    const factoryContract = `ERC20${type}TokenFactory`;

    const { address: tokenImpl } = await deploy(`ERC20${type}TokenImpl`, {
      from: deployer,
      log: true,
    });

    await deploy(factoryContract, {
      from: deployer,
      log: true,
      args: [
        owner,
        `OM!goods ERC20 ${type} Token Factory`, // name
        '0.0.1', // version
      ],
    });

    if (await read(factoryContract, 'initialized')) {
      log(`${factoryContract} already initialized`);
    } else {
      await execute(
        factoryContract,
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
  }
};

func.dependencies = ['gateway'];

module.exports = func;
