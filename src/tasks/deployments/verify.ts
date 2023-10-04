import { task } from 'hardhat/config';
import { TASK_ETHERSCAN_VERIFY } from 'hardhat-deploy';

task('deployments:verify', 'Verifies deployed contracts', async (_, hre) => {
  const { run } = hre;

  await run(TASK_ETHERSCAN_VERIFY);
});
