import { DeployFunction } from 'hardhat-deploy/types';
import { parseEther } from 'ethers';

const TOKEN_IMPL = 'ERC20ControlledTokenImpl' as const;
const TOKEN_FACTORY = 'ERC20ControlledTokenFactory' as const;
const TOKEN_DATA = {
  name: 'Controlled',
  symbol: 'CONTROLLED',
};

const TOKEN_MINT_VALUE = parseEther('100000000');
const TOKEN_BURN_VALUE = parseEther('50000000');

const TOKEN_TRANSFERS = [
  parseEther('3.5'), //
  parseEther('12000'),
  120,
];

const TOKEN_APPROVALS = [
  parseEther('1.5'), //
  parseEther('2000'),
];

const func: DeployFunction = async (hre) => {
  const {
    network: { live },
    deployments: { log, deploy, logTx, get },
    ethers: { getContractAt },
    getNamedAccounts,
    getUnnamedAccounts,
  } = hre;

  log();
  log('# token/erc20/controlled');

  const { deployer, owner } = await getNamedAccounts();

  const { address: gateway } = await get('Gateway');

  const { address: tokenImpl } = await deploy(TOKEN_IMPL, {
    from: deployer,
    log: true,
  });

  const tokenFactory = await deploy(TOKEN_FACTORY, {
    from: deployer,
    log: true,
    args: [
      owner,
      'OM!goods ERC20 Controlled Token Factory', // name
      '0.0.1', // version
    ],
  }).then(({ address }) => getContractAt(TOKEN_FACTORY, address));

  if (await tokenFactory.initialized()) {
    log(`${TOKEN_FACTORY} already initialized`);
  } else {
    await logTx(
      TOKEN_FACTORY,
      'initialize',
      tokenFactory.initialize(
        gateway,
        [], // guardians
        tokenImpl,
      ),
    );
  }

  // generate events
  if (live) {
    return;
  }

  const token = await getContractAt(
    TOKEN_IMPL,
    await tokenFactory.computeToken(TOKEN_DATA.symbol),
  );

  if (!(await tokenFactory.hasToken(token))) {
    await logTx(
      TOKEN_FACTORY,
      'createToken',
      tokenFactory.createToken(
        {
          ...TOKEN_DATA,
          controller: owner,
        },
        '0x',
      ),
    );
  }

  await logTx(TOKEN_IMPL, 'mint', token.mint(owner, TOKEN_MINT_VALUE));

  await logTx(TOKEN_IMPL, 'burn', token.burn(owner, TOKEN_BURN_VALUE));

  const accounts = await getUnnamedAccounts();

  for (let i in TOKEN_TRANSFERS) {
    const index = parseInt(i, 10);

    await logTx(
      TOKEN_IMPL,
      'transfer',
      token.transfer(accounts.at(index), TOKEN_TRANSFERS.at(index)),
    );
  }

  for (let i in TOKEN_APPROVALS) {
    const index = parseInt(i, 10);

    await logTx(
      TOKEN_IMPL,
      'approve',
      token.approve(accounts.at(index), TOKEN_APPROVALS.at(index)),
    );
  }
};

func.dependencies = ['gateway'];

module.exports = func;
