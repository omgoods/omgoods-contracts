import { DeployFunction } from 'hardhat-deploy/types';
import { parseEther } from 'ethers';

const TOKEN = {
  name: 'Controlled Token',
  symbol: 'CONTROLLED',
  initialSupply: parseEther('50000000'),
};

const TOKEN_TRANSFERS = [
  parseEther('100'),
  parseEther('3.5'),
  parseEther('100'),
  parseEther('10'),
];

const TOKEN_APPROVALS = [
  parseEther('1000'),
  parseEther('100'),
  parseEther('10'),
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
  log('# token/erc20/controlled/seed');

  const { owner: from } = await getNamedAccounts();

  const tokenData = {
    ...TOKEN,
    owner: from,
    minter: from,
    burner: from,
  };

  const typedDataEncoder = await createEncoder('ERC20ControlledTokenFactory');

  await execute(
    'ERC20ControlledTokenFactory',
    {
      from,
      log: true,
    },
    'createToken',
    tokenData,
    typedDataEncoder.sign(from, 'Token', tokenData),
  );

  const token = await getContractAt(
    'ERC20ControlledTokenImpl',
    await read('ERC20ControlledTokenFactory', 'computeToken', tokenData.symbol),
  );

  const account = randomAddress();

  await logTx(
    'ERC20ControlledTokenFactory.mint',
    token.mint(account, parseEther('100')),
  );

  await logTx(
    'ERC20ControlledTokenFactory.burn',
    token.burn(account, parseEther('50')),
  );

  for (const amount of TOKEN_TRANSFERS) {
    await logTx(
      'ERC20ControlledTokenFactory.transfer',
      token.transfer(randomAddress(), amount),
    );
  }

  for (const amount of TOKEN_APPROVALS) {
    await logTx(
      'ERC20ControlledTokenFactory.approve',
      token.approve(randomAddress(), amount),
    );
  }
};

func.tags = ['seed'];
func.dependencies = ['setup'];
func.skip = ({ network }) => Promise.resolve(network.live);

module.exports = func;
