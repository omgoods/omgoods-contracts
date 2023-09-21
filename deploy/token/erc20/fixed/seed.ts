import { DeployFunction } from 'hardhat-deploy/types';
import { MaxUint256, parseEther } from 'ethers';

const TOKEN = {
  name: 'Example Fixed Token',
  symbol: 'FIXED',
  totalSupply: parseEther('100000000'),
};

const TOKEN_TRANSFERS = [
  parseEther('200'),
  parseEther('1.5'),
  parseEther('4000'),
  parseEther('40'),
];

const TOKEN_APPROVALS = [
  parseEther('4000'), //
  MaxUint256,
  0,
];

const func: DeployFunction = async (hre) => {
  const {
    deployments: { log, read, execute, logTx },
    ethers: { getContractAt },
    typedData: { createEncoder },
    testing: { randomAddress },
    getNamedAccounts,
  } = hre;

  log();
  log('# token/erc20/fixed/seed');

  const { owner: from } = await getNamedAccounts();

  const tokenData = {
    ...TOKEN,
    owner: from,
  };

  const typedDataEncoder = await createEncoder('ERC20FixedTokenFactory');

  await execute(
    'ERC20FixedTokenFactory',
    {
      from,
      log: true,
    },
    'createToken',
    tokenData,
    typedDataEncoder.sign(from, 'Token', tokenData),
  );

  const token = await getContractAt(
    'ERC20FixedTokenImpl',
    await read('ERC20FixedTokenFactory', 'computeToken', tokenData.symbol),
  );

  for (const amount of TOKEN_TRANSFERS) {
    await logTx(
      'ERC20FixedTokenFactory.transfer',
      token.transfer(randomAddress(), amount),
    );
  }

  for (const amount of TOKEN_APPROVALS) {
    await logTx(
      'ERC20FixedTokenFactory.approve',
      token.approve(randomAddress(), amount),
    );
  }
};

func.tags = ['seed'];
func.dependencies = ['setup'];
func.skip = ({ network }) => Promise.resolve(network.live);

module.exports = func;
