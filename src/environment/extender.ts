import { extendEnvironment } from 'hardhat/config';
import { ProcessEnvs } from '../common';

extendEnvironment((hre) => {
  const { deployments, network } = hre;

  deployments.getAddress = async (name) => {
    const { get } = deployments;

    const deployment = await get(name);

    return deployment?.address || null;
  };

  hre.processEnvs = new ProcessEnvs(network?.config?.type);
});
