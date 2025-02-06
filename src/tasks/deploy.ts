import { task } from 'hardhat/config';
import ACTModule from '@/modules/ACT';

export const TASK_DEPLOY = 'deploy';

task(TASK_DEPLOY, 'Deploys all modules', async (_, hre) => {
  const { ignition } = hre;

  await ignition.deploy(ACTModule);
});
