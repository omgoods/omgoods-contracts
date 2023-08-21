import { task } from 'hardhat/config';

task<void>('build', 'Builds export files', async (_, hre) => {
  const {
    config: { deterministicDeployment: getDeterministicDeploymentConfig },
  } = hre;

  if (typeof getDeterministicDeploymentConfig !== 'function') {
    return;
  }

  // mainnet
  console.log(getDeterministicDeploymentConfig('1'));

  // testnet
  console.log(getDeterministicDeploymentConfig('5'));
});
