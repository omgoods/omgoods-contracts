import { task } from 'hardhat/config';
import { TASK_ETHERSCAN_VERIFY } from 'hardhat-deploy';
import { TaskNames } from './constants';

task(TaskNames.Verify, 'Verifies deployed contracts', async (_, hre) => {
  const { run } = hre;

  await run(TASK_ETHERSCAN_VERIFY);
});
