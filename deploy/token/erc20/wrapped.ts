import { DeployFunction } from 'hardhat-deploy/types';
import { parseEther, MaxUint256 } from 'ethers';

const TOKEN_IMPL = 'ERC20WrappedTokenImpl' as const;
const TOKEN_FACTORY = 'ERC20WrappedTokenFactory' as const;
const EXTERNAL_TOKEN_MOCK = 'ERC20ExternalTokenMock' as const;
const EXTERNAL_TOKEN_DATA = {
  name: 'External',
  symbol: 'EXTERNAL',
  totalSupply: parseEther('100000000'),
};

const TOKEN_DEPOSIT_VALUE = parseEther('100000000');
const TOKEN_WITHDRAW_VALUE = parseEther('50000000');

const TOKEN_TRANSFERS = [
  parseEther('1.5'), //
  parseEther('1000'),
  10,
];

const TOKEN_APPROVALS = [
  parseEther('1.5'), //
  parseEther('1000'),
  MaxUint256,
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
  log('# token/erc20/wrapped');

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
      'OM!goods ERC20 Wrapped Token Factory', // name
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

  const externalToken = await deploy(EXTERNAL_TOKEN_MOCK, {
    from: owner,
    log: true,
    args: [
      EXTERNAL_TOKEN_DATA.name,
      EXTERNAL_TOKEN_DATA.symbol,
      18,
      EXTERNAL_TOKEN_DATA.totalSupply,
    ],
  }).then(({ address }) => getContractAt(EXTERNAL_TOKEN_MOCK, address));

  const underlyingToken = await externalToken.getAddress();

  const token = await getContractAt(
    TOKEN_IMPL,
    await tokenFactory.computeToken(underlyingToken),
  );

  if (!(await tokenFactory.hasToken(token))) {
    await logTx(
      TOKEN_FACTORY,
      'createToken',
      tokenFactory.createToken(underlyingToken, '0x'),
    );
  }

  await logTx(
    EXTERNAL_TOKEN_MOCK,
    'approve',
    externalToken.approve(token, MaxUint256),
  );

  await logTx(TOKEN_IMPL, 'deposit', token.deposit(TOKEN_DEPOSIT_VALUE));

  await logTx(TOKEN_IMPL, 'withdraw', token.withdraw(TOKEN_WITHDRAW_VALUE));

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
