import { extendEnvironment } from 'hardhat/config';
import { Testing } from './Testing';
import { TypedDataDomain } from 'ethers';

extendEnvironment((hre) => {
  const { deployments, ethers, config } = hre;

  const { get, deploy } = deployments;

  const { id } = ethers;

  deployments.getAddress = async (name) => {
    const deployment = await get(name);

    return deployment ? deployment.address : null;
  };

  deployments.deploy = async (name, options) => {
    return deploy(name, {
      ...options,
      deterministicDeployment: id(name),
    });
  };

  hre.testing = new Testing(hre);

  hre.getTypedDataDomain = (contract) => {
    let result: TypedDataDomain;

    try {
      ({ typeDataDomain: result } = config.contracts[contract]);
    } catch (err) {
      //
    }

    if (!result) {
      throw Error(`${contract} type data domain not found`);
    }

    return result;
  };
});
