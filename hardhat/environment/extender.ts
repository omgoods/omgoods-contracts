import { extendEnvironment } from 'hardhat/config';
import { Testing } from './Testing';

extendEnvironment((hre) => {
  const { deployments, ethers } = hre;

  const { get, deploy } = deployments;

  const { id } = ethers;

  deployments.getAddress = async (name) => {
    const deployment = await get(name);

    return deployment ? deployment.address : null;
  };

  deployments.deploy = async (name, options) => {
    const { deterministicDeployment } = options;

    if (
      deterministicDeployment &&
      typeof deterministicDeployment === 'boolean'
    ) {
      options.deterministicDeployment = id(name);
    }

    return deploy(name, options);
  };

  hre.testing = new Testing(hre);
});
