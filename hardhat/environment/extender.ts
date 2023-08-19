import { extendEnvironment } from 'hardhat/config';
import { Testing } from './Testing';

extendEnvironment((hre) => {
  const { deployments } = hre;

  deployments.getAddress = async (name) => {
    const deployment = await deployments.get(name);

    return deployment ? deployment.address : null;
  };

  hre.testing = new Testing(hre);
});
