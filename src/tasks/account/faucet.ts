import { task } from 'hardhat/config';
import { TaskArgsWithSilent, customTypes, Logger } from '../common';
import { AccountTaskNames } from './constants';

task(AccountTaskNames.Faucet, 'Tops-up the account')
  .addParam('account', 'Account address', undefined, customTypes.address)
  .addParam('value', 'Top-up value', undefined, customTypes.ether)
  .addFlag('silent', 'Turn off logging')
  .setAction(
    async (
      args: TaskArgsWithSilent & {
        account: string;
        value: bigint;
      },
      hre,
    ) => {
      const {
        getNamedAccounts,
        ethers: { getSigner },
      } = hre;

      const { account, value, silent } = args;

      const logger = new Logger(!silent);

      const { faucet } = await getNamedAccounts();

      const sender = await getSigner(faucet);

      await logger.logTx(
        'Top-up account',
        sender.sendTransaction({
          to: account,
          value,
        }),
      );
    },
  );
