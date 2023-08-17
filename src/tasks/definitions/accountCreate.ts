import { registerTask, TaskNames } from '../common';

registerTask(TaskNames.accountCreate, {
  description: 'Create an account',
  async action(args, hre) {
    const {
      tasksUtils: {
        promptConfirm,
        promptText,
        getAccountAt,
        getAccountRegistry,
        processTransaction,
      },
      runTask,
    } = hre;

    const { signer } = await runTask(TaskNames.signerSelect, args);

    const accountRegistry = await getAccountRegistry(signer);

    const force = await promptConfirm({
      message: 'Force account creation',
      initial: false,
    });

    let accountAddress: string;

    if (force) {
      const saltOwner = await promptText({
        message: 'Salt owner',
        initial: signer.address,
      });

      if (!saltOwner) {
        return;
      }

      await processTransaction(accountRegistry.forceAccountCreation(saltOwner));

      accountAddress = await accountRegistry.computeAccount(saltOwner);
    } else {
      accountAddress = await promptText({
        message: 'Account',
        initial: await accountRegistry.computeAccount(signer),
      });

      if (!accountAddress) {
        return;
      }

      await processTransaction(accountRegistry.createAccount(accountAddress));
    }

    return {
      signer,
      account: await getAccountAt(accountAddress),
    };
  },
});
