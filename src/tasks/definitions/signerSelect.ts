import { TaskNames, registerTask } from '../common';

registerTask(TaskNames.signerSelect, {
  description: 'Select a signer',
  hidden: true,
  async action(args, hre) {
    let { signer, rootCall } = args;

    if (!signer || rootCall) {
      const {
        config: { namedAccounts },
        ethers: { getSigners },
        tasksUtils: { promptSelect },
      } = hre;

      let maxIndex = null;

      const names: Record<number, string> = Object.entries(
        namedAccounts,
      ).reduce((result, [name, index]) => {
        if (typeof index === 'number') {
          maxIndex = maxIndex === null ? index : Math.max(maxIndex, index);

          result = {
            ...result,
            [index]: name,
          };
        }

        return result;
      }, {});

      const signers = await getSigners();

      signer = await promptSelect({
        message: 'Signer',
        initial: maxIndex === null ? 0 : maxIndex + 1,
        choices: signers.map((signer, index) => {
          const { address } = signer;

          const name = names[index];

          return {
            title: `[${index}] ${address}${name ? ` # ${name}` : ''}`,
            value: signer,
          };
        }),
      });
    }

    return !signer
      ? null
      : {
          signer,
        };
  },
});
