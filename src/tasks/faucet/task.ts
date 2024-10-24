import { task } from 'hardhat/config';
import { customTypes, Logger } from '../common';
import { FAUCET_TASK_NAME } from './constants';
import { FaucetTaskArgs } from './interfaces';

task(FAUCET_TASK_NAME, 'Top-ups account')
  .addParam('account', 'Account address', undefined, customTypes.address)
  .addParam('amount', 'Top-up amount', undefined, customTypes.ether)
  .addFlag('silent', 'Turn off logging')
  .setAction(async (args: FaucetTaskArgs, hre) => {
    const {
      getNamedAccounts,
      ethers: { getSigner },
    } = hre;

    const { account, amount, silent } = args;

    const logger = new Logger(!silent);

    const { faucet } = await getNamedAccounts();

    const sender = await getSigner(faucet);

    await logger.logTx(
      'Sending transaction',
      sender.sendTransaction({
        to: account,
        value: amount,
      }),
    );
  });
