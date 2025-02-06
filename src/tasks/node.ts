import { task, subtask } from 'hardhat/config';
import {
  TASK_NODE,
  TASK_NODE_SERVER_READY,
} from 'hardhat/builtin-tasks/task-names';
import { TASK_DEPLOY } from './deploy';

let serverReadyOptions: {
  deployModules?: boolean;
} = {};

task(TASK_NODE)
  .addFlag('deployModules', 'Deploys all modules after running the node')
  .setAction(
    async (
      args: {
        deployModules: boolean;
      },
      _hre,
      runSuper,
    ) => {
      const { deployModules } = args;

      serverReadyOptions = {
        deployModules,
      };

      return runSuper(args);
    },
  );

subtask(TASK_NODE_SERVER_READY) //
  .setAction(async (_args, hre, runSuper) => {
    const result = await runSuper();

    const { run } = hre;

    const { deployModules } = serverReadyOptions;

    if (deployModules) {
      await run(TASK_DEPLOY, {
        silent: true,
      });
    }

    return result;
  });
