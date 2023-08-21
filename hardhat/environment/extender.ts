import { extendEnvironment } from 'hardhat/config';
import { TypedDataDomain } from 'ethers';
import { Testing } from './Testing';

extendEnvironment((hre) => {
  const { deployments, ethers, config } = hre;

  // testing

  hre.testing = new Testing(hre);

  // deployments

  const { deploy } = deployments;

  deployments.deploy = async (name, options) => {
    const { id } = ethers;

    return deploy(name, {
      ...options,
      deterministicDeployment: id(name),
    });
  };

  deployments.getAddress = async (name) => {
    const { get } = deployments;

    const deployment = await get(name);

    return deployment?.address || null;
  };

  // typed data

  hre.getTypedDataDomain = (contract) => {
    let result: TypedDataDomain;

    const { contracts } = config;

    try {
      ({ typeDataDomain: result } = contracts[contract]);
    } catch (err) {
      //
    }

    if (!result) {
      throw Error(`${contract} type data domain not found`);
    }

    return result;
  };
});
