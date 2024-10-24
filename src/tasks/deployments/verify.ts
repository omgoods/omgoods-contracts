import { task } from 'hardhat/config';
import { TASK_ETHERSCAN_VERIFY } from 'hardhat-deploy';
import { DeploymentsTaskNames } from './constants';

task(DeploymentsTaskNames.Verify, 'Verifies deployed contracts').setAction(
  async (_, hre) => {
    const { run } = hre;

    await run(TASK_ETHERSCAN_VERIFY);
  },
);
