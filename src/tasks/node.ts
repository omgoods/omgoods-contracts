import { task, subtask } from 'hardhat/config';
import {
  TASK_NODE,
  TASK_NODE_SERVER_READY,
} from 'hardhat/builtin-tasks/task-names';
import { TASK_DEPLOY } from './deploy';

interface NodeArgs {
  deployModules: boolean;
}

let nodeServerReadyOptions: {
  deployModules?: boolean;
} = {};

task(TASK_NODE)
  .addFlag('deployModules', 'Deploy all modules after running the node')
  .setAction(async (args: NodeArgs, _, runSuper) => {
    const { deployModules } = args;

    nodeServerReadyOptions = {
      deployModules,
    };

    return runSuper(args);
  });

subtask(TASK_NODE_SERVER_READY, async (_, hre, runSuper) => {
  const result = await runSuper();

  const { run } = hre;

  const { deployModules } = nodeServerReadyOptions;

  if (deployModules) {
    await run(TASK_DEPLOY);
  }

  return result;
});
