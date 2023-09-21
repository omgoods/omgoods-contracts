import { DeployFunction } from 'hardhat-deploy/types';
import { parseEther, MaxUint256 } from 'ethers';

const TOKEN = {
  name: 'Wrapped Token',
  symbol: 'WRAPPED',
};

const TOKEN_TRANSFERS = [
  parseEther('50'),
  parseEther('4000'),
  parseEther('1.2'),
];

const TOKEN_APPROVALS = [
  parseEther('1000'),
  parseEther('2000'),
  parseEther('3000'),
  0,
];

const func: DeployFunction = async (hre) => {
  const {
    deployments: { log, deploy, read, execute, logTx, getAddress },
    ethers: { getContractAt },
    typedData: { createEncoder },
    testing: { randomAddress },
    getNamedAccounts,
  } = hre;

  log();
  log('# token/erc20/wrapped/seed');

  const { owner: from } = await getNamedAccounts();

  const { address } = await deploy('ERC20ExternalTokenMock', {
    from,
    log: false,
    args: ['External Token', 'EXTERNAL', 18, parseEther('1000000000')],
    deterministicDeployment: false,
  });

  const externalToken = await getContractAt('ERC20ExternalTokenMock', address);

  const underlyingToken = await externalToken.getAddress();

  const typedDataEncoder = await createEncoder('ERC20WrappedTokenFactory');

  await execute(
    'ERC20WrappedTokenFactory',
    {
      from,
      log: true,
    },
    'createToken',
    underlyingToken,
    await typedDataEncoder.sign(from, 'Token', {
      underlyingToken,
    }),
  );

  const token = await getContractAt(
    'ERC20WrappedTokenImpl',
    await read('ERC20WrappedTokenFactory', 'computeToken', underlyingToken),
  );

  await externalToken.approve(token, MaxUint256);

  await logTx(
    'ERC20WrappedTokenFactory.deposit',
    token.deposit(parseEther('50000000')),
  );

  await logTx(
    'ERC20WrappedTokenFactory.withdrawTo',
    token.withdrawTo(randomAddress(), parseEther('10000000')),
  );

  for (const amount of TOKEN_TRANSFERS) {
    await logTx(
      'ERC20WrappedTokenFactory.transfer',
      token.transfer(randomAddress(), amount),
    );
  }

  for (const amount of TOKEN_APPROVALS) {
    await logTx(
      'ERC20WrappedTokenFactory.approve',
      token.approve(randomAddress(), amount),
    );
  }
};

func.tags = ['seed'];
func.dependencies = ['setup'];
func.skip = ({ network }) => Promise.resolve(network.live);

module.exports = func;
