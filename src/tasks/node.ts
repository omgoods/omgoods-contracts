import { subtask } from 'hardhat/config';
import { TASK_NODE_SERVER_READY } from 'hardhat/builtin-tasks/task-names';
import ACTModule from '@/modules/ACT';

const MODULES = [ACTModule];

subtask(TASK_NODE_SERVER_READY, async (_, hre, runSuper) => {
  const result = await runSuper();

  const { ignition } = hre;

  for (const module of MODULES) {
    await ignition.deploy(module);
  }

  return result;
});
