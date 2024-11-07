import { subtask } from 'hardhat/config';
import { TASK_NODE_SERVER_READY } from 'hardhat/builtin-tasks/task-names';
import { TaskArgsWithSilent } from './common';
import { DeploymentsTaskNames } from './deployments';

subtask(TASK_NODE_SERVER_READY, async (_, hre, runSuper) => {
  await runSuper();

  const { run } = hre;

  await run(DeploymentsTaskNames.Export, {
    silent: true,
  } as TaskArgsWithSilent);
});
