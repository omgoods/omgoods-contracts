import { registerTask, TaskNames } from '../common';

registerTask(TaskNames.accountSelect, {
  description: 'Select an account',
  hidden: true,
  async action(args, hre) {
    const { tasksUtils, runTask } = hre;

    // TODO

    return args;
  },
});
