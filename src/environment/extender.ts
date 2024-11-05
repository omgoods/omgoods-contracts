import { extendEnvironment } from 'hardhat/config';
import { ProcessEnvs } from '../common';
import { Utils } from './Utils';

extendEnvironment((hre) => {
  const { deployments, network } = hre;

  deployments.getAddress = async (name) => {
    const { get } = deployments;

    const deployment = await get(name);

    return deployment?.address || null;
  };

  deployments.logHeader = (tag, version) => {
    const { log } = deployments;

    log();
    log(`# ${version}: ${tag}`);
  };

  hre.processEnvs = new ProcessEnvs(network?.config?.type);

  hre.utils = new Utils(hre);
});
